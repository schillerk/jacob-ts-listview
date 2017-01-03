
import * as Util from './util';

/*
Example of the state object:

{
  gestaltInstances: [
    {
      instanceId, // 0
      gestaltId,
      expandedChildren: [
        {
          instanceId, // 0.0
          gestaltId,
          expandedChildren: [
            instanceId, // 0.0.0
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
    expandedChildren: GestaltInstance[]
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