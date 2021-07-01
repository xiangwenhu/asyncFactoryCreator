import { delay, isPromise } from "./util";

interface AVFunction<T = unknown> {
    (value: T): void
}

export interface InstanceCreator<T> {
    (...args: any): (Promise<T> | T)
}

export default function asyncFactoryCreator<R = unknown, RR = unknown>(timeout: number = 5 * 1000) {
    let requests: { reject: AVFunction<RR>, resolve: AVFunction<R> }[] = [];
    let instance: R;
    let initializing = false;

    return function asyncFactory(fn: InstanceCreator<R>, context: unknown, ...args: unknown[]): Promise<R> {

        if (typeof fn !== "function") {
            throw new SyntaxError("参数fn必须是一个函数")
        }

        // 实例已经实例化过了
        if (instance !== undefined) {
            return Promise.resolve(instance);
        }

        // 初始化中
        if (initializing) {
            return new Promise((resolve, reject) => {
                requests.push({
                    resolve,
                    reject
                })
            })
        }

        initializing = true;

        return create(fn, context, ...args) as Promise<R>;

    }

    function create(fn: InstanceCreator<R>, context: unknown, ...args: unknown[]) {
        return new Promise((resolve, reject) => {

            requests.push({
                resolve,
                reject
            })

            const { run, cancel } = delay(timeout);

            run().then(() => {
                initializing = false;
                const error = new Error("操作超时");
                processRequests("reject", error);
            });

            try {
                const tempRes = fn.apply(context, args);

                // 返回的不是一个Promise对象
                if (!isPromise(tempRes)) {
                    cancel();
                    instance = tempRes;
                    initializing = false;
                    processRequests('resolve', instance);
                }

                tempRes.then(res => {
                    // 初始化成功
                    cancel();
                    instance = res;
                    initializing = false;
                    processRequests('resolve', instance);
                })
                    .catch(error => {
                        // 初始化失败
                        cancel();
                        initializing = false;
                        processRequests('reject', error);
                    })

            } catch (error) {
                cancel();
                initializing = false;
                processRequests('reject', error);
            }
        })
    }

    function processRequests(type: "resolve" | "reject", value: any) {
        // 挨个resolve
        requests.forEach(q => {
            q[type](value);
        });
        // 置空请求，之后直接用instance
        requests = [];
    }
}