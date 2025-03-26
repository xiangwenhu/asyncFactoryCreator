import { delay, isPromise, isSymbolSupported } from "./util";

interface AVFunction<T = unknown> {
    (value: T): any
}

export interface InstanceCreator<T> {
    (...args: any): (Promise<T> | T)
}


const defaultInstance = isSymbolSupported() ? Symbol("_default_instance_") : Object.create(null);


export interface Options {
    
}

export default function createsSingletonFactory<R = unknown>(timeout: number = 5 * 1000) {
    let requests: { reject: AVFunction<any>, resolve: AVFunction<R> }[] = [];
    // 不能使用undefined等，防止创建方法返回的就是undefined等
    let instance: any = defaultInstance;
    let initializing = false;

    function batchProcessRequests(type: "resolve" | "reject", value: any) {
        // 挨个resolve
        requests.forEach(q => {
            q[type](value);
        });
        // 置空请求，之后直接用instance
        requests = [];
    }


    function create(fn: InstanceCreator<R>, context: unknown, ...args: unknown[]) {
        return new Promise((resolve, reject) => {
            requests.push({
                resolve,
                reject
            })

            const { run, cancel: cancelTimeout } = delay(timeout);

            run().then(() => {
                initializing = false;
                const error = new Error("操作超时");
                batchProcessRequests("reject", error);
            });

            try {
                const tempRes = fn.apply(context, args);

                // 返回的不是一个Promise对象
                if (!isPromise(tempRes)) {
                    cancelTimeout();
                    instance = tempRes as R;
                    initializing = false;
                    batchProcessRequests('resolve', instance);
                    return;
                }

                (tempRes as Promise<R>).then(function (res) {
                    // 初始化成功
                    cancelTimeout();
                    instance = res;
                    initializing = false;
                    batchProcessRequests('resolve', instance);
                })
                    .catch(error => {
                        // 初始化失败
                        cancelTimeout();
                        initializing = false;
                        batchProcessRequests('reject', error);
                    })

            } catch (error) {
                cancelTimeout();
                initializing = false;
                batchProcessRequests('reject', error);
            }
        })
    }



    return function asyncFactory(fn: InstanceCreator<R>, context: unknown, ...args: unknown[]): Promise<R> {

        if (typeof fn !== "function") {
            throw new SyntaxError("参数fn必须是一个函数")
        }

        // 实例已经实例化过了
        if (instance !== defaultInstance) {
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
}