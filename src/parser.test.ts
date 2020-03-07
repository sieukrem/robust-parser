import * as assert from "chai";
import { Parser } from "./parser";

describe("Parser",()=>{
    describe("ctor",()=>{
        it("throws on redeclaration of rule", ()=>{
            assert.expect(()=>{
                const parser = new Parser({ startRules:["rule1"], rules: [{name:"rule1", regex:/./g}, {name:"rule1",regex:/./g}]}); 
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
                {name:"rule1", regex: /abc/g, fn: (p,match, isCalledAsStop )=>{
                    calledTimes++;
                    }
                }]
            });
            testee.parse("abc   abc cba"),

            assert.expect(calledTimes).to.eq(2);
        });
    });
});