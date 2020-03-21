export interface IRule<TPayload>{
    name : string;
    regex : RegExp;
    inner?: string[];
    stops?: string[];
    fn?: ((match:RegExpExecArray, isCalledAsStop:boolean, payload?:TPayload)=>void);
}

export interface IRules<TPayload>{
    rules: IRule<TPayload>[];
    startRules: string[];
}

export class Parser<TPayload>{
    private getHashOfRules(rules:IRules<TPayload>):any{
        const hash : any = {};
        for(var i=0; i<rules.rules.length; i++){
            var rule = rules.rules[i];
            if (hash[rule.name]) {
                throw new Error("State with the same name exists");
            }
            if (!rule.regex.global) {
                throw new Error("Expect regex definition with 'g' flag");
            }
                
            hash[rule.name] = rule;
        }
        return hash;
    }

    private hashOfRules:any;

    private getClosestMatch(rulesOfContext:string[], position:number, text:string): {match:RegExpExecArray, rule:IRule<TPayload>}|null{
        let last : {match:RegExpExecArray, rule:IRule<TPayload>}|null = null;
        for(var i=0; i<rulesOfContext.length;i++){
            var rule = this.hashOfRules[rulesOfContext[i]];
            rule.regex.lastIndex = position;
            var match = rule.regex.exec(text);
            if(!match) {
                continue;
            }
            
            if (!(!last || last.match.index > match.index)) {
                continue;
            }
            
            last = {match:match, rule:rule};
        }
        return last;
    }



    public parse(text:string, payload?:TPayload):void{
        let context : any = { prev:null, rules: this.rules.startRules || [], stops:[] };
        const state : any = {pos:0, text:text};

        while(context){            
            const closestMatch = this.getClosestMatch(context.stops.concat(context.rules), state.pos, text);
            if (!closestMatch){ // nothing found leave current context
                context = context.prev;
                continue;
            }
            
            const isStop = context.stops.indexOf(closestMatch.rule.name)>=0;
            
            if (closestMatch.rule.fn) {
                closestMatch.rule.fn(closestMatch.match, isStop, payload);
            }

            if (isStop){
                context = context.prev;
                continue;
            }

            state.pos = closestMatch.rule.regex.lastIndex;
            
            if (closestMatch.rule.inner) {
                context = { prev: context, rules: closestMatch.rule.inner, stops: closestMatch.rule.stops||[] };
            }
        }
    }

    public constructor(private readonly rules:IRules<TPayload>){
        this.hashOfRules = this.getHashOfRules(rules);
	}
}