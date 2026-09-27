import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTransactions, getCategories, getCategoryById } from "./api";

function mockFetchOnce({ ok = true, status = 200, body = {} } = {}) {
    global.fetch = vi.fn().mockResolvedValue({
        ok,
        status,
        json: vi.fn().mockResolvedValue(body),
    });
}

describe("api.js", () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("getTransactions", () => {
        it("fetches without a query string when no params are given", async () => {
            mockFetchOnce({ body: [{ id: 1 }] });

            const result = await getTransactions();

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/transactions");
            expect(result).toEqual([{ id: 1 }]);
        });

        it("appends params as a query string", async () => {
            mockFetchOnce({ body: [] });

            await getTransactions({ category: "food", limit: "10" });

            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/transactions?category=food&limit=10"
            );
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 500 });

            await expect(getTransactions()).rejects.toThrow(
                "Failed to fetch transactions (status 500)"
            );
        });
    });

    describe("getCategories", () => {
        it("fetches categories and returns parsed json", async () => {
            mockFetchOnce({ body: [{ id: 1, name: "Food" }] });

            const result = await getCategories();

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/categories");
            expect(result).toEqual([{ id: 1, name: "Food" }]);
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 404 });

            await expect(getCategories()).rejects.toThrow(
                "Failed to fetch categories (status 404)"
            );
        });
    });

    describe("getCategoryById", () => {
        it("fetches a single category by id", async () => {
            mockFetchOnce({ body: { id: 5, name: "Rent" } });

            const result = await getCategoryById(5);

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/categories/5");
            expect(result).toEqual({ id: 5, name: "Rent" });
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 404 });

            await expect(getCategoryById(999)).rejects.toThrow(
                "Failed to fetch category (status 404)"
            );
        });
    });
});
