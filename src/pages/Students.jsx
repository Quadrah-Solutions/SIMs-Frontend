export default function Students () {
    const studentColumns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'class', label: 'Class' },
        { key: 'allergies', label: 'Allergies' },
        { key: 'lastVisit', label: 'Last Visit' },
    ];

    const handleRowClick = () => {
        // In a real app, this would route to /students/S001
        alert(`Navigating to profile for ama ataa aidoo #2333`);
        // Simulating the actual route change for demo
    };

    return (
        <Card title="Student Directory">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">All Registered Students</h2>
                <button
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
                    onClick={() => alert('New student form would open.')}
                >
                    + Add Student
                </button>
            </div>
            <Table 
                columns={studentColumns} 
                // data={STUDENTS_DATA} 
                onRowClick={handleRowClick}
            />
        </Card>
    );
};