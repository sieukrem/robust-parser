import * as assert from "chai";
import { Parser } from "./parser";

describe("Parser",()=>{
    describe("ctor",()=>{
        it("throws on redeclaration of rule", ()=>{
            assert.expect(()=>{
                const parser = new Parser({ startRules:["rule1"], rules: [{name:"rule1", regex:/./g}, {name:"rule1",regex:/./g}]}); 
            }).to.throw();
        });
        it("throws on missing start rule", ()=>{
            assert.expect(()=>{
                const parser = new Parser({ startRules:["rule2"], rules: [{name:"rule1", regex:/./g}]}); 
            }).to.throw();
        });
        it("throws on missing inner rule", ()=>{
            assert.expect(()=>{
                const parser = new Parser({ startRules:["rule1"], rules: [{name:"rule1", inner:["rule2"], regex:/./g}, {name:"rule3",regex:/./g}]}); 
            }).to.throw();
        });
        it("throws on missing stop rule", ()=>{
            assert.expect(()=>{
                const parser = new Parser({ startRules:["rule1"], rules: [{name:"rule1", stops:["rule2"], regex:/./g}, {name:"rule3",regex:/./g}]}); 
            }).to.throw();
        });        
        it("throws on non global regex definition", ()=>{
            assert.expect(()=>{
                const parser = new Parser({ startRules:["rule1"], rules:[{name:"rule1",regex:/./}]}); 
            }).to.throw();
        });
        it("accepts proper definition", ()=>{
                const parser = new Parser({ startRules:["rule1"], rules:[{name:"rule1",regex:/./g}]}); 
        });
    });

    describe("parse",()=>{
        it("calls fn when matches", ()=>{
            let calledTimes : number = 0;
            const testee = new Parser({ startRules : ["rule1"], rules:[
                {name:"rule1", regex: /abc/g, fn: (match, isCalledAsStop)=>{
                    calledTimes++;
                    }
                }]
            });
            testee.parse("abc   abc cba"),

            assert.expect(calledTimes).to.eq(2);
        });

        it("provide payload to match fn", ()=>{
            let payloadObj = {a:"a"};
            let captured = null;
            const testee = new Parser<{a:any}>
            ({ startRules : ["rule1"], rules:[
                {name:"rule1", regex: /abc/g, fn: (match, isCalledAsStop, payload)=>{
                    captured = payload;
                    }
                }]
            });
            testee.parse("abc   abc cba", payloadObj),

            assert.expect(captured).to.eq(payloadObj);
        });
    });
});