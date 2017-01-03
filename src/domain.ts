
import * as Util from './util';

/*
Example of the state object:

{
  gestaltInstances: [
    {
      instanceId, // 0
      gestaltId,
      expanded,
      children: [
        {
          instanceId, // 0.0
          gestaltId,
          expanded,
          children: [
            instanceId, // 0.0.0
            gestaltId,
            expanded,
            children: [...]
          ]
        }
      ]
    }
  ],
  allGestalts: {
    id,
    text,
    relatedIds: []
  },



allInstances: {
    [instanceId: string]: GestaltInstance
  },
}

*/


export interface Gestalt {
  gestaltId: string
  text: string
  relatedIds: string[]
}

export interface GestaltHierarchicalViewItemContents {
  instanceId: string //1.0.2.1
  gestaltId: string
  children: GestaltHierarchicalViewItemContents[]
  expanded: boolean

  // childInstanceIds: string[]
}

export interface HydratedGestaltHierarchicalViewItemContents extends GestaltHierarchicalViewItemContents {
  gestalt: Gestalt
  hydratedChildren: HydratedGestaltHierarchicalViewItemContents[]
}













export interface GestaltInstanceLookupMap {
  [instanceId: string]: GestaltHierarchicalViewItemContents
}

export function createGestaltInstance(gestalt: Gestalt) {
  // var newInstance : GestaltInstance = {
  //     instanceId: Util.genGUID(),
  //     childInstances: [],
  //     expanded: true,
  //     gestaltId: gestalt.gestaltId
  // }
  // return newInstance;
}

export interface GestaltCollection {
  [gestaltId: string]: Gestalt
}

