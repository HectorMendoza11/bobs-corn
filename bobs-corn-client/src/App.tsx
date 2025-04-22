import { useEffect, useState } from "react";
import axios from "axios";

interface Purchase {
  timestamp: string;
}

function App() {
  const [clientOptions, setClientOptions] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [newClientName, setNewClientName] = useState<string>("");
  const [cornData, setCornData] = useState<Record<string, { count: number; history: Purchase[] }>>({});
  const [message, setMessage] = useState<string>("");
  const [showCorn, setShowCorn] = useState<boolean>(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const currentData = cornData[selectedClient] || { count: 0, history: [] };

  // const dataToDisplay =
  //   loadingPurchases && cornData[selectedClient]
  //     ? cornData[selectedClient]
  //     : currentData;

  const handleAddClient = () => {
    const name = newClientName.trim();
    if (name && !clientOptions.includes(name)) {
      setClientOptions((prev) => [...prev, name]);
      setCornData((prev) => ({ ...prev, [name]: { count: 0, history: [] } }));
      setSelectedClient(name);
      setNewClientName("");
      setMessage(""); // Clear previous message
    }
  };

  const buyCorn = async () => {
    try {
      const res = await axios.post("http://localhost:3000/buy-corn", {
        client_id: selectedClient,
      });

      if (res.status === 200) {
        const timestamp = new Date().toLocaleString();
        const updatedClientData = {
          count: currentData.count + 1,
          history: [...currentData.history, { timestamp }],
        };

        setCornData((prev) => ({
          ...prev,
          [selectedClient]: updatedClientData,
        }));

        setMessage("🌽 You bought a corn!");
        setShowCorn(true);
        setTimeout(() => setShowCorn(false), 1000);
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setMessage("🚫 Too fast! Only 1 corn per minute.");
      } else {
        setMessage("❌ Something went wrong.");
      }
    }
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!selectedClient) return;
      setLoadingPurchases(true);
  
      try {
        const res = await axios.get(`http://localhost:3000/api/purchases/${selectedClient}`);
        const history = res.data.map((entry: { purchase_time: string }) => ({
          timestamp: new Date(entry.purchase_time).toLocaleString(),
        }));
  
        setCornData((prev) => ({
          ...prev,
          [selectedClient]: {
            count: history.length,
            history,
          },
        }));
      } catch (err) {
        console.error("Error fetching purchase history:", err);
      } finally {
        setLoadingPurchases(false);
      }
    };
  
    fetchPurchases();
  }, [selectedClient]);

  // Fetch client list from backend on component mount
  useEffect(() => {
    const fetchClientList = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/clients');
        setClientOptions(response.data); // Populate dropdown with client list
        setSelectedClient(response.data[0] || ""); // Set the first client as default
      } catch (err) {
        console.error("Error fetching client list:", err);
      }
    };
    fetchClientList();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 py-10 px-6 font-sans flex flex-col items-center">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-yellow-700 mb-6">🌽 Bob’s Corn</h1>

        {/* Add New Client */}
        <div className="flex gap-4 justify-center items-center mb-6 flex-wrap">
          <input
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="Add new client..."
            className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none transition w-full sm:w-80 placeholder:text-gray-400 text-gray-700"
          />
          <button
            onClick={handleAddClient}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition active:scale-95"
          >
            ➕ Add
          </button>
        </div>

        {/* Client Dropdown */}
        <div className="mb-6 text-center">
          <label className="block text-lg mb-2 text-yellow-700 font-medium">Select Client</label>
          <select
            value={selectedClient}
            onChange={(e) => {
              const newClient = e.target.value;
              setSelectedClient(newClient);
              setMessage("");         // Clear old success/error message
              setShowCorn(false);     // Hide the 🌽 animation (if used)
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none transition w-full sm:w-80"
          >
            {clientOptions.map((name, index) => (
              <option key={`${name}-${index}`} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Buy Corn Button */}
        <button
          onClick={buyCorn}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 active:scale-95"
        >
          🌽 Buy Corn
        </button>

        <p className="mt-4 text-xl text-green-700 font-medium">
          {selectedClient}, you’ve bought {currentData.count} corn{currentData.count !== 1 && "s"}.
        </p>

        {message && <p className="mt-2 text-red-600">{message}</p>}

        {showCorn && (
          <div className="fixed top-1/2 left-1/2 text-6xl animate-bounce -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            🌽
          </div>
        )}
      </div>

      {/* Purchase History Table */}
      {loadingPurchases ? (
      <div className="text-center text-yellow-600 mt-10">Loading purchases...</div>
        ) : currentData.history.length > 0 ? (
          <div className="mt-12 w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-700 text-center">
              {selectedClient}’s Purchase History
            </h2>
            <div className="overflow-hidden rounded-xl border border-yellow-300 shadow-md">
              <table className="w-full table-auto text-left text-sm">
                <thead className="bg-yellow-100 text-yellow-800 font-semibold text-sm uppercase tracking-wide">
                  <tr>
                    <th className="py-3 px-4 border-b border-yellow-200">#</th>
                    <th className="py-3 px-4 border-b border-yellow-200">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentData.history.map((entry, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-yellow-50"}
                    >
                      <td className="py-2 px-4 border-b border-yellow-100">{index + 1}</td>
                      <td className="py-2 px-4 border-b border-yellow-100">{entry.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            {selectedClient} has no purchases yet.
          </div>
        )}
    </div>
  );
}

export default App;
