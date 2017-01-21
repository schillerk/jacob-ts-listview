

export interface Stack<T> {
        push(v: T): void
        pop(): T | undefined
        toArray():T[]
}

class LLNode<T> {
    next: LLNode<T> | null = null
    val: T

    constructor(val: T, next: LLNode<T> | null = null) {
        this.val = val
        this.next = next

    }

    toString(): string {
        return this.val + ""
    }
}

export class LinkedList<T> implements Stack<T> {
    head: LLNode<T> | null = null

    push(v: T): void {
        let n: LLNode<T> = new LLNode<T>(v)
        n.next = this.head
        this.head = n
    }

    pop(): T | undefined {
        let o: LLNode<T> | null = this.head
        if(o!==null && this.head) {
            this.head=this.head.next
            return o.val
        }
        return undefined
    }

    // push(s:any ) : void {
    //     if(typeof s === "string") {

    //     let n: LLNode =new LLNode(s)
    //     n.next=this.head
    //     this.head=n
    //     }
    // }

    // push(n:LLNode ) : void


    // push(n:any ) : void {
    //     console.log(typeof n)
    //     if(typeof n === "string") {
    //         this.push(new LLNode(n))
    //     }
    //     else if(typeof n === "LLNode") {
    //         n.next=this.head
    //         this.head=n
    //     }
    //     else
    //         throw "er"
    // }

    //prints results in reverse insertion order
    toString(): string {
        let n: LLNode<T> | null = this.head
        let o: string = ""
        while (n !== null) {
            o += n.toString() + "->"
            n = n.next
        }
        o+="[null]"

        return o
    }

    //prints results in reverse insertion order
    toArray(): T[] {
        let n: LLNode<T> | null = this.head
        let o: T[] = []
        while (n !== null) {
            o.push(n.val)
            n = n.next
        }

        return o
    }
}

// let l: Stack<string> = new LinkedList<string>()

// l.push("yo")
// l.push("yo2")
// l.push("yo3")
// console.log(l.toString())
// console.log(l.pop())
// console.log(l.toString())



