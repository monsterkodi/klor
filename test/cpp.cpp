#include "GridMode.h"
#include "UObject/ConstructorHelpers.h"

AGridMode::AGridMode()
{
    NodeFraction = 0.0f;
    GridGrid     = nullptr;
}

AGridGrid * AGridMode::CreateGrid()
{
    GridGrid = GetWorld()->SpawnActor<AGridGrid>(GridBlueprint, FVector(0,0,0), FRotator(0,0,0));
    return GridGrid;
}

float AGridMode::AStarHeuristic(const FGridRouteNode & start, const FGridRouteNode & goal)
{
    return FVector::DistSquared(goal.GridNode.Location * 0.01f, start.GridNode.Location * 0.01f);
}

FGridRouteNode AGridMode::LowestFScore(const TSet<FGridRouteNode> & openSet, const TMap<FGridRouteNode, float> & fScore)
{
    FGridRouteNode lowest;
    float lowestScore = MAX_FLT;
    for (auto node : openSet)
    {
        if (fScore[node] < lowestScore)
        {
            lowest = node;
            lowestScore = fScore[node];
        }
    }
    return lowest;
}

AGridVoxel * AGridMode::GridVoxelAtPos(const FIntVector & pos) const
{
    return Cast<AGridVoxel>(ActorAtPos(pos));
}

AGridBot * AGridMode::GridBotAtPos(const FIntVector & pos) const
{
    return Cast<AGridBot>(ActorAtPos(pos));
}

AActor * AGridMode::ActorAtPos(const FIntVector & pos) const
{
    return GridGrid->ActorAtPos(pos);
}

static FIntVector SidePos[6][4] = { 
    FIntVector(-1,0,0),
    FIntVector(0,+1,0),
    FIntVector(0,0,+1),
    { FIntVector(0,1,0), FIntVector(0,-1,0), FIntVector(0,0,1), FIntVector(0,0,-1) },
    { FIntVector(1,0,0), FIntVector(-1,0,0), FIntVector(0,1,0), FIntVector(0,-1,0) },
};

static EDir DownDir[6][4] = {
    { EDir::YN, EDir::YP , EDir::ZN , EDir::ZP },
};

TArray<FGridRouteNode> AGridMode::NeighborNodes(const FGridRouteNode & routeNode)
{
    TArray<FGridRouteNode> neighbors;

    FIntVector pos = routeNode.GridNode.Pos;
    FIntVector dwn = DownPos[(uint8)dir];

    for (uint8 ni = 0; ni < 4; ni++)
    {
        FIntVector side = SidePos[(uint8)dir][ni];

        if (!GridVoxelAtPos(pos + side))
        {
            if (GridVoxelAtPos(pos + side + dwn))
            {
                neighbors.Add(FGridRouteNode(pos + side, dir));
            }
            else
            {
                neighbors.Add(FGridRouteNode(pos + side + dwn, DownDir[(uint8)dir][ni]));
            }
        }
        else
        {
            neighbors.Add(FGridRouteNode(pos, SideDir[(uint8)dir][ni]));
        }
    }
}


void AGridMode::UpdateRunners(float delta)
{
    NodeFraction += delta * RunnerSpeed;

    if (NodeFraction >= 1)
    {
        NodeFraction -= 1;

        for (auto pair : Routes)
        {
            auto route = pair.Value;
            for (int i = route->Runners.Num()-1; i >= 0; i--)
            {
                route->Runners[i]->Advance();
            }
        }        
    }

    for (auto pair : Routes)
    {
        for (auto runner : route->Runners)
        {
            runner->Update(NodeFraction);
        }
    }
}

AGridRoute * AGridMode::AddRoute(AGridBot * source, AGridBot * target)
{
    AGridRoute * route = nullptr;
    if (GetWorld())
    {
        if (Routes.Contains(source))
        {
            Routes[source]->Destroy();
        }

        route = GetWorld()->SpawnActor<AGridRoute>(RouteBlueprint, FVector(0,0,0), FRotator(0,0,0));
        route->RouteNodes = CalcRoute(source, target);
        route->Target = target;
        route->CreateNodesAndEdges(RouteNodeBlueprint, RouteEdgeBlueprint, RouteNodeRadius, RouteEdgeRadius);
        route->Init();

        Routes.Add(source, route);
    }
    return route;
}

void AGridMode::UpdateRoutesToTarget(AGridBot * target)
{
    if (GetWorld())
    {
        TArray<AGridRoute*> targetRoutes;

        for (auto botRoute : Routes)
        {
            if (botRoute.Value->Target == target)
            {
                targetRoutes.Add(botRoute.Value);
            }
        }

        for (auto route : targetRoutes)
        {
            AddRoute(route->Source, route->Target);
        }
    }
}

FRotator AGridMode::MakeRotator(const FGridRouteNode & source, const FGridRouteNode & target)
{
    FVector targetOnPlane = FVector::PointPlaneProject(target.GridNode.Location, source.GridNode.Location, source.GridNode.Up);
    FVector sourceToTargetOnPlane = targetOnPlane - source.GridNode.Location;

    return FRotator(FQuat::FindBetweenVectors(FVector(0,0,1), sourceToTargetOnPlane));
}

TArray<FGridRouteNode> AGridMode::CalcRoute(AGridBot * source, AGridBot * target)
{
    TArray<FGridRouteNode> route;

    TMap<FGridRouteNode, FGridRouteNode> cameFrom;
    TMap<FGridRouteNode, float> fScore;

    FGridRouteNode startNode(source);

    openSet.Add(startNode);
    gScore.Add(startNode, 0.0f);
    fScore.Add(startNode, AStarHeuristic(startNode, goalNode));

    while (openSet.Num())
    {
        FGridRouteNode current = LowestFScore(openSet, fScore);

        if (current == goalNode) // route found ...
        {
            route.Add(current); // first node is the target
            while (cameFrom.Contains(current))
            {
                current = cameFrom[current];
                route.Insert(current, 0);
            }

            for (int i = 0; i < route.Num(); i++)
            {
                if (i > 0)
                {
                    route[i].ToSource = MakeRotator(route[i], route[i-1]);

                    if (route[i].GridNode.Dir != route[i-1].GridNode.Dir)
                    {
                        route[i].SourceKnick = FVector::DotProduct(route[i].GridNode.Up, route[i-1].GridNode.Location - route[i].GridNode.Location) > 0 ? EKnick::Up : EKnick::Down;
                    }
                }
                else
                {
                    route[i].ToSource = FRotator(FQuat::FindBetweenVectors(FVector(0,0,1), route[i].GridNode.Up));
                }

                if (i < route.Num()-1)
                {
                    route[i].ToTarget = MakeRotator(route[i], route[i+1]);

                    if (route[i].GridNode.Dir != route[i+1].GridNode.Dir)
                    {
                        route[i].TargetKnick = FVector::DotProduct(route[i].GridNode.Up, route[i+1].GridNode.Location - route[i].GridNode.Location) > 0 ? EKnick::Up : EKnick::Down;
                    }
                }
                else
                {
                    route[i].ToTarget = FRotator(FQuat::FindBetweenVectors(FVector(0,0,1), route[i].GridNode.Up));
                    route[i].TargetKnick = EKnick::Home;
                }
            }
            return route;
        }

        openSet.Remove(current);

        TArray<FGridRouteNode> neighborNodes = NeighborNodes(current);
        for (auto neighbor : neighborNodes)
        {
            if (!openSet.Find(neighbor))
            {
                openSet.Add(neighbor);
            }

            float tScore = gScore[current] + 1.0f;
            if (gScore.Contains(neighbor) && tScore >= gScore[neighbor])
            {
                continue;
            }

            cameFrom.Add(neighbor, current);
            gScore.Add(neighbor, tScore);
            fScore.Add(neighbor, tScore + AStarHeuristic(neighbor, goalNode));
        }
    }

    UE_LOG(LogTemp, Error, TEXT("NO ROUTE!"));
}

FIntVector AGridMode::LocationToPos(const FVector & location) const
{
    return PosForLocation(location);
}
