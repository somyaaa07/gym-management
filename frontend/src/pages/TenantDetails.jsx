import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TenantDetails = () => {
    const { tenantId } = useParams();
    const navigate = useNavigate();

    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `http://localhost:5001/api/v1/tenant/${tenantId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch gym details"
                    );
                }

                setTenant(result.data);
            } catch (error) {
                console.error("Tenant details error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTenant();
    }, [tenantId]);

    if (loading) {
        return (
            <div className="p-6">
                Loading gym details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="p-6">
                Gym not found
            </div>
        );
    }

    return (
        <div className="p-6">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">

                <button
                    onClick={() => navigate("/app/tenants")}
                    className="px-4 py-2 border rounded-lg"
                >
                    ← Back
                </button>

                <div>
                    <h1 className="text-2xl font-bold">
                        {tenant.name}
                    </h1>

                    <p className="text-gray-500">
                        Gym Details
                    </p>
                </div>

            </div>


            {/* Gym Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">

                <h2 className="text-xl font-semibold mb-5">
                    Gym Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                        <p className="text-sm text-gray-500">
                            Gym Name
                        </p>
                        <p className="font-medium">
                            {tenant.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Email
                        </p>
                        <p className="font-medium">
                            {tenant.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Phone
                        </p>
                        <p className="font-medium">
                            {tenant.phone}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Status
                        </p>
                        <p className="font-medium">
                            {tenant.status}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Subscription
                        </p>
                        <p className="font-medium">
                            {tenant.subscription_plan}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Address
                        </p>
                        <p className="font-medium">
                            {tenant.address_line}, {tenant.city},{" "}
                            {tenant.state} - {tenant.postal_code}
                        </p>
                    </div>

                </div>

            </div>


            {/* Branch Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">

                <h2 className="text-xl font-semibold">
                    Branches
                </h2>

                <p className="text-gray-500 mt-1">
                    Total branches
                </p>

                <p className="text-3xl font-bold mt-3">
                    {tenant.branch_count}
                </p>

            </div>


            {/* Branches */}
            <div className="bg-white rounded-xl p-6 shadow-sm">

                <h2 className="text-xl font-semibold mb-5">
                    All Branches
                </h2>

                {tenant.branches?.length === 0 ? (
                    <p className="text-gray-500">
                        No branches found.
                    </p>
                ) : (
                    <div className="space-y-4">

                        {tenant.branches.map((branch) => (
                            <div
                                key={branch.id}
                                className="border rounded-xl p-5"
                            >

                                <div className="flex justify-between mb-4">

                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {branch.name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            Code: {branch.code}
                                        </p>
                                    </div>

                                    <span>
                                        {branch.status
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Phone
                                        </p>
                                        <p>{branch.phone}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Email
                                        </p>
                                        <p>{branch.email}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Address
                                        </p>
                                        <p>{branch.address_line}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Location
                                        </p>
                                        <p>
                                            {branch.city}, {branch.state}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Postal Code
                                        </p>
                                        <p>{branch.postal_code}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Capacity
                                        </p>
                                        <p>{branch.capacity}</p>
                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
};

export default TenantDetails;