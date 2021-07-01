export function delay(delay: number = 5000, fn = () => { }, context = null) {
    let ticket = null;
    return {
        run(...args: any[]) {
            return new Promise((resolve, reject) => {
                ticket = setTimeout(async () => {
                    try {
                        const res = await fn.apply(context, args);
                        resolve(res);
                    } catch (err) {
                        reject(err);
                    }
                }, delay);
            });
        },
        cancel: () => {
            clearTimeout(ticket);
        }
    };
};


export const isObject = value => value !== null &&
    (typeof value === 'object' || typeof value === 'function');

export function isPromise(value: any) {
    return value instanceof Promise ||
        (
            isObject(value) &&
            typeof value.then === 'function' &&
            typeof value.catch === 'function'
        );
}

