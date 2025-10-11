export default function StudentProfile  () {

    

    const visitHistory = [
        { date: '2024-10-01', complaint: 'Headache', treatment: 'Paracetamol & rest', staff: 'Nurse Jane' },
        { date: '2024-09-10', complaint: 'Minor cut', treatment: 'Antiseptic & bandage', staff: 'Dr. Admin' },
    ];

    return (
        <Card title={`Student Profile: Kwesi sasu `} className="space-y-6">
            <button 
                className="text-sm text-emerald-600 hover:underline mb-4 block"
            >
                &larr; Back to Students List
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-bold text-gray-700">Student ID:</h4>
                    <p className="text-lg">#23232</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-700">Class:</h4>
                    <p className="text-lg">Sci 4 </p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-700">Allergies:</h4>
                    <p className="text-lg text-red-600 font-semibold">Doesnt like pepper</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-700">Last Visit:</h4>
                    <p className="text-lg">{student.lastVisit}</p>
                </div>
            </div>

            <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
                + Start New Visit
            </button>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8">Visit History</h3>
            <Table
                columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'complaint', label: 'Complaint' },
                    { key: 'treatment', label: 'Treatment' },
                    { key: 'staff', label: 'Staff' },
                ]}
                data={visitHistory}
            />
        </Card>
    );
};
