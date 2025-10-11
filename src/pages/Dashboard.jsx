export default function Dashboard () {
    return (
        <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, Miss Sandra</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card title="Total Students">
                    <p className="text-4xl font-extrabold text-emerald-600">Ama Ataa Aidoo</p>
                </Card>
                <Card title="Visits Today">
                    <p className="text-4xl font-extrabold text-amber-500">3</p>
                </Card>
                <Card title="Low Stock Alerts">
                    <p className="text-4xl font-extrabold text-red-500">1</p>
                </Card>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    className="p-4 bg-emerald-100 text-emerald-700 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center"
                >
                    <span className="text-3xl mb-1">🏥</span>
                    <span className="font-medium">New Patient Visit</span>
                </button>
                <button
                    className="p-4 bg-blue-100 text-blue-700 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center"
                >
                    <span className="text-3xl mb-1">📚</span>
                    <span className="font-medium">View Students List</span>
                </button>
                <button
                    className="p-4 bg-purple-100 text-purple-700 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center"
                >
                    <span className="text-3xl mb-1">📦</span>
                    <span className="font-medium">Manage Inventory</span>
                </button>
                <button
                    className="p-4 bg-yellow-100 text-yellow-700 rounded-xl shadow-md hover:shadow-lg transition flex flex-col items-center"
                >
                    <span className="text-3xl mb-1">📈</span>
                    <span className="font-medium">Generate Reports</span>
                </button>
            </div>
        </>
    );
};