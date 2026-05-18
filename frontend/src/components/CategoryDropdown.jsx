import { useState } from "react";

const CategoryDropdown = ({ categories, value, onChange }) => {
    const [open, setOpen] = useState(false);

    const selected = categories.find(c => c.id === value);

    return (
        <div className="relative">
            {/* Bouton */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="border border-gray-500 rounded-full px-6 py-2 text-xl text-left bg-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-gray-700"
            >
                <span className={value ? "text-gray-800" : "text-gray-500"}>
                    {selected ? selected.name : "Rubrique"}
                </span>

                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Menu */}
            {open && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => {
                                onChange(cat.id);
                                setOpen(false);
                            }}
                            className="px-5 py-3 hover:bg-gray-100 cursor-pointer"
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryDropdown;