export default function Visits (){
    const visitColumns = [
        { key: 'id', label: 'ID' },
        { key: 'student', label: 'Student' },
        { key: 'class', label: 'Class' },
        { key: 'time', label: 'Time' },
        { key: 'complaint', label: 'Complaint' },
        { key: 'status', label: 'Status', render: (status) => (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status === 'Complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
            </span>
        )},
    ];
    const mockVisits = [
        { id: 'V005', student: 'Ama Owusu', class: 'JHS 1C', time: '10:30 AM', complaint: 'Sore throat', status: 'Pending' },
        { id: 'V004', student: 'Kwame Adjei', class: 'JHS 2B', time: '09:45 AM', complaint: 'Fever', status: 'Complete' },
        { id: 'V003', student: 'Aisha Mensah', class: 'JHS 3A', time: 'Yesterday', complaint: 'Stomach Ache', status: 'Complete' },
    ];

    return (
        <Card title="Patient Visits Log">
            <div className="flex justify-end mb-4">
                <button
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
                >
                    + Log New Visit
                </button>
            </div>
            <Table columns={visitColumns} data={mockVisits} />
        </Card>
    );
};
