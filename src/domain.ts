
import * as Util from './util';

/*
Example of the state object:

{
  gestaltInstances: [
    {
      instanceId,
      gestaltId,
      expandedChildren: [
        {
          instanceId,
          gestaltId,
          expandedChildren: [
            instanceId,
            gestaltId,
            expandedChildren: [...]
          ]
        }
      ]
    }
  ],
  gestalts: {
    id,
    text,
    relatedIds: []
  },
  gestaltInstanceLookupMap: {
    instanceId1: { instanceId, gestaltId, expandedChildren: [...] },
    instanceId2: { ...},
    ...
  }
}

*/


export interface Gestalt {
    gestaltId: string
    text: string
    relatedIds: string[]
}

export interface GestaltCollection {
    [gestaltId: string]: Gestalt
}

export interface GestaltInstance {
    instanceId: string
    gestaltId: string
    expandedChlidren: GestaltInstance[]
}

export interface GestaltInstanceLookupMap {
    [instanceId: string]: GestaltInstance
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