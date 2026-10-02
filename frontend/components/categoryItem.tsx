"use client";

import Modal from "./modal";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import  { addCategory, editCategory, deleteCategoryById } from "@/lib/api";

export function CategoryItem({ category }: { category: any }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSelected = searchParams.get("category") === String(category.id);

    const handleClickCategory = () => {
        router.push(isSelected ? "/" : `/?category=${category.id}`);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEdit = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        try {
            console.log(await editCategory(category.id, String(form.get("name"))));
            setOpen(false);
            router.refresh();
        } catch (err) {
            setError("Failed to edit category");
        }
    };

    const handleDeleteCategory = async (id: number) => {
        try {
            await deleteCategoryById(id);
            setDeleteError("");
            router.refresh();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Failed to delete category");
        }
    }

    return (
    <div className="categoryItemContainer">
        <button onClick={handleClickCategory} className={`categoryName${isSelected ? " selected" : ""}`}>{category.name}</button>
        <div className="categoryButtonContainer">
            <button onClick={() => setOpen(true)}>Edit</button>
            <button
                className="deleteButton"
                onClick={() => handleDeleteCategory(category.id)}
            >
                Delete
            </button>
        </div>
        {deleteError && <p className="modalError">{deleteError}</p>}
        {open && (
            <Modal title="Edit Category" onClose={handleClose}>
                <form className="modalForm" onSubmit={handleEdit}>
                <label>
                    Name
                    <input
                        name="name"
                        type="text"
                        defaultValue={category.name}
                        required
                    />
                </label>
                {error && <p className="modalError">{error}</p>}
                <div className="modalButtons">
                    <button type="button" className="modalCancelButton" onClick={handleClose}>
                        Cancel
                    </button>
                    <button type="submit" className="modalConfirmButton">
                        Confirm edit
                    </button>
                </div>
                </form>
            </Modal>
        )}
      </div>
    );
}

export function CategoryHeader() {

    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleClose = () => {
        setOpen(false);
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        try {
            await addCategory(String(form.get("name")))
            setOpen(false);
            router.refresh();
        } catch (err) {
            setError("Failed to add category");
        }
    }

    return (
        <div className="categoryHeaderContainer">
            <h1 className="headerText">Categories</h1>
            <button className="addCategoryButton" onClick={() => setOpen(true)}>
                + Add
            </button>
            {open && (
                <Modal title="Add Category" onClose={handleClose}>
                    <form className="modalForm" onSubmit={handleSubmit}>
                        <label>
                            Name
                            <input name="name" type="text" required />
                        </label>
                        {error && <p className="modalError">{error}</p>}
                        <div className="modalButtons">
                            <button type="button" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="addTransactionButton">Add</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}