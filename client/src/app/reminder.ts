export class Reminder {
    constructor(
        public id: number=null,
        public category: string=null,
        public desc: string=null,
        public date:string=null,
        public start_time: Date=null,
        public status: string=null,
        public comments: string=null
    ){

    }
}
