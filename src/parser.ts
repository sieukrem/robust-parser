export interface IRule{
    name : string;
    regex : RegExp;
    inner?: string[];
    stops?: string[];
    fn?: ((parser: Parser, match:RegExpExecArray, isCalledAsStop:boolean)=>void);
}

export interface IRules{
    rules: IRule[];
    startRules: string[];
}

export class Parser{
    private getHashOfRules(rules:IRules):any{
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

    private getClosestMatch(rulesOfContext:string[], position:number, text:string): {match:RegExpExecArray, rule:IRule}|null{
        let last : {match:RegExpExecArray, rule:IRule}|null = null;
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

    private hashOfRules:any;
    private context:any;
    private state:any;

    public parse(text:string):void{
        this.context = { prev:null, rules: this.rules.startRules || [], stops:[] };
        this.state = {pos:0, text:text};
        while(this.context){            
            const closestMatch = this.getClosestMatch(this.context.stops.concat(this.context.rules), this.state.pos, text);
            if (!closestMatch){ // nothing found leave current context
                this.context = this.context.prev;
                continue;
            }
            
            const isStop = this.context.stops.indexOf(closestMatch.rule.name)>=0;
            
            if (closestMatch.rule.fn) {
                closestMatch.rule.fn(this, closestMatch.match, isStop);
            }

            if (isStop){
                this.context = this.context.prev;
                continue;
            }

            this.state.pos = closestMatch.rule.regex.lastIndex;
            
            if (closestMatch.rule.inner) {
                this.context = { prev: this.context, rules: closestMatch.rule.inner, stops: closestMatch.rule.stops||[] };
            }
        }
    }
    public constructor(private readonly rules:IRules){
        this.hashOfRules = this.getHashOfRules(rules);
	}
}