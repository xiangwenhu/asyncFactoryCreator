export function delay(delay: number = 5000, fn = (..._args: any[]) => { }, context: any = undefined) {
    let ticket: number | undefined | NodeJS.Timeout = undefined;
    return {
        run(...args: any[]) {
            return new Promise(function (resolve, reject) {
                ticket = setTimeout(function () {
                    Promise.resolve(fn.apply(context, args)).then(resolve).catch(reject)
                }, delay);
            });
        },
        cancel: () => {
            clearTimeout(ticket);
        }
    };
};


export const isObject = (value: any) => value !== null &&
    (typeof value === 'object' || typeof value === 'function');

export function isPromise(value: any) {
    return value instanceof Promise ||
        (
            isObject(value) &&
            typeof value.then === 'function' &&
            typeof value.catch === 'function'
        );
}


export function isSymbolSupported(): boolean {
    // 检测全局 Symbol 是否存在且为函数类型
    if (typeof Symbol !== 'function') {
        return false;
    }

    try {
        // 验证 Symbol 的行为特性
        const sym = Symbol('test');
        return (
            typeof sym === 'symbol' && // 类型需为 symbol
            typeof Symbol.toStringTag === 'symbol' && // 内置属性检查
            Object(sym) instanceof Symbol // 原始值与对象包装类型分离特性
        );
    } catch (e) {
        return false;
    }
}