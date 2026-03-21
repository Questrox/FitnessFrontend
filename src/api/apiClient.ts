import { ApiClient, ApiException } from "./g";

const client = new ApiClient("");

// универсальная обертка
async function safeCall<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (e) {
        if (e instanceof ApiException) {
            let message = `Ошибка ${e.status}: `;
            console.log(e.response)
            try {
                const data = JSON.parse(e.response);
                message += data?.title || data?.detail || data?.message || "Неизвестная ошибка";
            } catch {
                message += e.response || "Неизвестная ошибка";
            }
            throw new Error(message);
        }
        throw e;
    }
}

// прокси, который автоматически оборачивает все методы ApiClient
export const apiClient: ApiClient = new Proxy(client, {
    get(target, prop: string) {
        const orig = (target as any)[prop];
        if (typeof orig === "function") {
            return (...args: any[]) => safeCall(() => orig.apply(target, args));
        }
        return orig;
    }
});