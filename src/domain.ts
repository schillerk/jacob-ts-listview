
import * as Util from './util';
import { LazyArray } from "./LazyArray"
import * as Immutable from 'immutable'


export interface Gestalt {
  readonly gestaltId: string
  readonly text: string
  readonly gestaltHeight?: number
  readonly relatedIds: ReadonlyArray<string>
  // readonly dateCreated: number
}

export interface GestaltInstance {
  readonly instanceId: string // uuid
  readonly gestaltId: string | undefined //undefined if root
  readonly childrenInstanceIds: ReadonlyArray<string>
  readonly expanded: boolean // is displayed fully => children instance ids are present vs null,
}

export interface HydratedGestalt extends Gestalt {
  readonly relatedGestalts: ReadonlyArray<Gestalt>
}

export interface HydratedGestaltInstance extends GestaltInstance {
  readonly shouldFocus?: boolean
  readonly gestalt: HydratedGestalt | undefined //undefined if root
  readonly hydratedChildren: ReadonlyArray<HydratedGestaltInstance> | LazyArray<HydratedGestaltInstance> 
  // readonly childrenHeights?: number[] //assert should be here if isRoot
  readonly idx?:number
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

export interface GestaltsMap extends Immutable.Map<string, Gestalt> {

}

export interface GestaltInstancesMap extends Immutable.Map<string, GestaltInstance> {
}

/*
hydratedRootGestaltInstance =
{
  instanceId: "UNIQUE_KEY_I_R",
  gestaltId: "UNIQUE_KEY_G_R",
  expanded: true, //all direct children of root are always expanded
  childrenInstanceIds: ["UNIQUE_KEY_I_C1", "UNIQUE_KEY_I_C2"],

  gestalt: {
    gestaltId: "UNIQUE_KEY_G_R",
    text: "[Root text is not shown]",
    textHeight? : 36,
    relatedIds: null,
    isRoot? : true
  },

  hydratedChildren: [
    {
      instanceId: "UNIQUE_KEY_I_1",
      gestaltId: "UNIQUE_KEY_G_1",
      expanded: true, //all direct children of root are always expanded
      childrenInstanceIds: ["UNIQUE_KEY_I_C1", "UNIQUE_KEY_I_C2"],

      gestalt: {
        gestaltId: "UNIQUE_KEY_G_1",
        text: "Explaining the gist of OOP and FP to modern Web Devs",
        textHeight? : 36, // TODO: move it out as it is a presentation detail
        relatedIds: ["UNIQUE_KEY_G_C1", "UNIQUE_KEY_G_C2"],
        isRoot? : false
      },
      hydratedChildren: [
        {
          instanceId: "UNIQUE_KEY_I_C1",
          gestaltId: "UNIQUE_KEY_G_C1",
          expanded: true,
          childrenInstanceIds: ["UNIQUE_KEY_21"],

          gestalt: {
            gestaltId: "UNIQUE_KEY_G_C1",
            text: "Write Redux review",
            textHeight? : 36,
            relatedIds: ["UNIQUE_KEY_G_C1_C1"],
            isRoot? : false
          },

          hydratedChildren: [
            instanceId: "UNIQUE_KEY_I_C1_C1",
            gestaltId: "UNIQUE_KEY_G_C1_C1",
            expanded: true,
            children: [...]
          ]
        },

        {
         instanceId: "UNIQUE_KEY_I_C2",
         gestaltId: "UNIQUE_KEY_G_C2",
         expanded: true,
         childrenInstanceIds: ["UNIQUE_KEY_I_C2_C1"],

         gestalt: {
           gestaltId: "UNIQUE_KEY_G_C2",
           text: "Learn Redux",
           textHeight? : 36,
           relatedIds: ["UNIQUE_KEY_G_C2_C1"],
           isRoot? : false
         },

         hydratedChildren: [
           instanceId: "UNIQUE_KEY_I_C2_C1",
           gestaltId: "UNIQUE_KEY_G_C2_C1",
           expanded: true,
           children: [...]
         ]
        },
      ]
    }
  ],

 }*/

// Example of the state object:
/*

state= {
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
