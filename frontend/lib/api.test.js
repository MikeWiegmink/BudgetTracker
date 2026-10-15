import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    getTransactions,
    getCategories,
    getCategoryById,
    addTransaction,
    deleteTransactionById,
    editTransaction,
    deleteCategoryById,
    addCategory,
    editCategory,
    getSummary,
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

    describe("getSummary", () => {
        it("fetches the summary with params as a query string", async () => {
            const summary = { month: null, total: 30, average: 15, max: 20 };
            mockFetchOnce({ body: summary });

            const result = await getSummary({ category_id: "2" });

            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/summary?category_id=2"
            );
            expect(result).toEqual(summary);
        });

        it("supports date and category_id combined", async () => {
            mockFetchOnce({ body: {} });

            await getSummary({ date: "2026-08", category_id: "1" });

            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:8080/summary?date=2026-08&category_id=1"
            );
        });

        it("returns null when no transactions are found (404)", async () => {
            mockFetchOnce({ ok: false, status: 404 });

            await expect(getSummary({ category_id: "9" })).resolves.toBeNull();
        });

        it("throws an error with the status code on other failures", async () => {
            mockFetchOnce({ ok: false, status: 500 });

            await expect(getSummary({ category_id: "1" })).rejects.toThrow(
                "Failed to fetch summary (status 500)"
            );
        });
    });

    describe("addCategory", () => {
        it("POSTs the name as json and returns the created category", async () => {
            mockFetchOnce({ body: { id: 4, name: "Travel" } });

            const result = await addCategory("Travel");

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Travel" }),
            });
            expect(result).toEqual({ id: 4, name: "Travel" });
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 409 });

            await expect(addCategory("Food")).rejects.toThrow(
                "Failed to add category (status 409)"
            );
        });
    });

    describe("editCategory", () => {
        it("PUTs the new name as json and returns the updated category", async () => {
            mockFetchOnce({ body: { id: 2, name: "Groceries" } });

            const result = await editCategory(2, "Groceries");

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/categories/2", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Groceries" }),
            });
            expect(result).toEqual({ id: 2, name: "Groceries" });
        });

        it("throws an error with the status code when the response is not ok", async () => {
            mockFetchOnce({ ok: false, status: 404 });

            await expect(editCategory(99, "X")).rejects.toThrow(
                "Failed to edit category (status 404)"
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

    describe("deleteCategoryById", () => {
        it("sends a DELETE request for the given id", async () => {
            mockFetchOnce({ status: 204 });

            await deleteCategoryById(3);

            expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/categories/3", {
                method: "DELETE",
            });
        });

        it("throws the server's error message when the category is in use", async () => {
            mockFetchOnce({
                ok: false,
                status: 409,
                body: { error: "Category is used by existing transactions" },
            });

            await expect(deleteCategoryById(1)).rejects.toThrow(
                "Category is used by existing transactions"
            );
        });

        it("falls back to the status code when the response has no error body", async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: vi.fn().mockRejectedValue(new Error("no body")),
            });

            await expect(deleteCategoryById(1)).rejects.toThrow(
                "Failed to delete category (status 500)"
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
