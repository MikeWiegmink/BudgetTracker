"use client";

import { useRouter } from "next/navigation";

export function CategoryItem({ category }: { category: any }) {
    const router = useRouter();

    const handleEditCategory = async (id: number) => {
        console.log(`Edit category with id: ${id}`);
    }

    const handleDeleteCategory = async (id: number) => {
        console.log(`Delete category with id: ${id}`);
    }

    return (
        <div className="categoryItemContainer">
            <p className="categoryName">{category.name}</p>
            <div className="categoryButtonContainer">
                <button onClick={() => handleEditCategory(category.id)}>Edit</button>
                <button className="deleteButton" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
            </div>
        </div>
    );
}

export function CategoryHeader() {

    const handleAddCategory = () => {
        console.log("Add Category button clicked");
    }

    return (
        <div className="categoryHeaderContainer">
            <h1 className="headerText">Categories</h1>
            <button className="addCategoryButton" onClick={() => handleAddCategory()}>
                + Add
            </button>
        </div>
    );
}