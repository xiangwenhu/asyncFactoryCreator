import assert from "assert";
import createsSingletonFactory from "../src";
import { delay } from "../src/util";

describe("createsSingletonFactory", function () {

    this.timeout(10 * 1000);

    describe('#创建异步实例', function () {

        it("每个实例应该相同", function (done) {

            interface RES {
                p1: number
            }
            const factory = createsSingletonFactory<RES>();

            async function asyncInsCreator(this: any, options: unknown = {}) {
                await delay(2000 + 2000 * Math.random()).run();
                // throw new Error("asyncInsCreator error")
                const result = new Object(options) as RES;
                return result;
            }

            function getAsyncIns(context: unknown, options: unknown = {}) {
                return factory(asyncInsCreator, context, options);
            }

            const context = {
                name: "context"
            };

            Promise.all([
                factory(asyncInsCreator, context, { p1: 1 }), // 或者 factory(asyncInsCreator, context, { p1: 1 })
                getAsyncIns(context, { p1: 2 }),
                getAsyncIns(context, { p1: 3 })
            ]).then(([ins1, ins2, ins3]) => {

                try {
                    assert.equal(ins1, ins1)
                    assert.equal(ins2, ins3)
                    assert.equal(ins3, ins1)
                } catch (err) {
                    return done(err)
                }

                done();

            })
        })

        it("实例创建方法返回undefined", function (done) {
     
            const factory = createsSingletonFactory<any>();

            async function asyncInsCreator(this: any, options: unknown = {}) {
                await delay(2000 + 2000 * Math.random()).run();               
                return undefined;
            }

            function getAsyncIns(context: unknown, options: unknown = {}) {
                return factory(asyncInsCreator, context, options);
            }

            const context = {
                name: "context"
            };

            Promise.all([
                factory(asyncInsCreator, context, { p1: 1 }), // 或者 factory(asyncInsCreator, context, { p1: 1 })
                getAsyncIns(context, { p1: 2 }),
                getAsyncIns(context, { p1: 3 })
            ]).then(([ins1, ins2, ins3]) => {

                try {
                    assert.equal(ins1, undefined)
                    assert.equal(ins2, undefined)
                    assert.equal(ins3, undefined)
                } catch (err) {
                    return done(err)
                }

                done();

            })
        })

    });


    describe('#创建同步实例', function () {

        it("每个实例应该相同", function (done) {

            const factory = createsSingletonFactory<any>();

            function syncInsCreator(options: unknown = {}): any {
                return {
                    name: "tom"
                };
            }

            function getSyncIns(context: unknown, options: unknown = {}) {
                return factory(syncInsCreator, context, options);
            }

            const context = {};

            Promise.all([
                getSyncIns(context, { p1: 1 }),
                getSyncIns(context, { p1: 2 }),
                getSyncIns(context, { p1: 3 })
            ]).then(([ins1, ins2, ins3]) => {

                try {
                    assert.equal(ins1, ins1)
                    assert.equal(ins2, ins3)
                    assert.equal(ins3, ins1)
                } catch (err) {
                    return done(err)
                }

                done();

            })
        })

    });


})
