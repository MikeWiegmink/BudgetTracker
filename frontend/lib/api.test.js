import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    getTransactions,
    getCategories,
    getCategoryById,
    addTransaction,
    deleteTransactionById,
    editTransaction,
} from "./api";

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

    describe("addTransaction", () => {
        it("POSTs the transaction as json and returns the created transaction", async () => {
            const created = { id: 1, desc: "Coffee", amount: 4.5, date: "2026-09-30", category_id: 2 };
            mockFetchOnce({ body: created });

            const result = await addTransaction("Coffee", 4.5, "2026-09-30", 2);

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    desc: "Coffee",
                    amount: 4.5,
                    date: "2026-09-30",
                    category_id: 2,
                }),
            });
            expect(result).toEqual(created);
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 400 });

            await expect(addTransaction("", 0, "", null)).rejects.toThrow(
                "Failed to add transaction (status 400)"
            );
        });

        it("propagates network errors", async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

            await expect(addTransaction("Coffee", 4.5, "2026-09-30", 2)).rejects.toThrow(
                "network down"
            );
        });
    });

    describe("deleteTransactionById", () => {
        it("sends a DELETE request for the given id", async () => {
            mockFetchOnce({ status: 204 });

            const result = await deleteTransactionById(7);

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/transactions/7", {
                method: "DELETE",
            });
            expect(result).toBeUndefined();
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 404 });

            await expect(deleteTransactionById(999)).rejects.toThrow(
                "Failed to delete transaction (status 404)"
            );
        });
    });

    describe("editTransaction", () => {
        it("PUTs the updated fields as json and returns the updated transaction", async () => {
            const updated = { id: 3, desc: "Lunch", amount: 12, date: "2026-09-29", category_id: 1 };
            mockFetchOnce({ body: updated });

            const result = await editTransaction(3, "Lunch", 12, "2026-09-29", 1);

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/transactions/3", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    desc: "Lunch",
                    amount: 12,
                    date: "2026-09-29",
                    category_id: 1,
                }),
            });
            expect(result).toEqual(updated);
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 500 });

            await expect(
                editTransaction(3, "Lunch", 12, "2026-09-29", 1)
            ).rejects.toThrow("Failed to edit transaction (status 500)");
        });
    });
});
