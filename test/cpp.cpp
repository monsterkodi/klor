#pragma once

#include "GridMode.h"
#include "UObject/ConstructorHelpers.h"

#ifdef hello
# if 
#   define world
# else
#   undef
# endif
#else 
#pragma once
#endif

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

AGridVoxel * AGridMode::GridVoxelAtPos(const FIntVector & pos) const
{
    return Cast<AGridVoxel>(ActorAtPos(pos));
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
    AGridRoute * route = nullptr;

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
    }
    
    for (auto route : targetRoutes)
    {
        AddRoute(route->Source, route->Target);
    }
    
    TArray<FGridRouteNode> route;

    TMap<FGridRouteNode, FGridRouteNode> cameFrom;
    TMap<FGridRouteNode, float> fScore;

    TArray<FGridRouteNode> neighborNodes = NeighborNodes(current);

    UE_LOG(LogTemp, Error, TEXT("NO ROUTE!"));
}
