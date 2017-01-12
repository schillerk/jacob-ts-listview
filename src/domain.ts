
import * as Util from "./util"

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
  textHeight?: number
  relatedIds: string[] // generates nubs
  isRoot?: boolean
}

export interface GestaltInstance {
  instanceId: string // uuid
  gestaltId: string
  expandedChildInstanceIds: string[] // initially null if created as a nub, can be non-null and non-expanded if expanded then collapsed
  expanded: boolean // is displayed fully => children instance ids are present vs null,
  version: number
  parentInstanceId: string
}

export interface GestaltIdToGestaltInstanceIdsMap {
  [gestaltId: string] : string[]
}

// export function createGestaltInstance(gestalt: Gestalt) {
  // var newInstance : GestaltInstance = {
  //     instanceId: Util.genGUID(),
  //     childInstances: [],
  //     expanded: true,
  //     gestaltId: gestalt.gestaltId
  // }
  // return newInstance;
// }

export interface GestaltsMap {
  [gestaltId: string]: Gestalt
}

export interface GestaltInstancesMap {
    [id: string]: GestaltInstance
}