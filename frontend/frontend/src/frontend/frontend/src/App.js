import React, { useState } from 'react';
import axios from 'axios';

// আপনার ব্যাকএন্ড URL এখানে পরিবর্তন করুন যখন লাইভ হবে
const API_URL = 'http://localhost:5000/api'; 

function App() {
  const [view, setView] = useState('home'); // 'home', 'admin'
  const [mobile, setMobile] = useState('');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [jsonInput, setJsonInput] = useState('');

  // কাস্টমার সার্চ ফাংশন
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mobile) return;
    setLoading(true);
    setError('');
    setClient(null);

    try {
      const res = await axios.get(`${API_URL}/client/${mobile}`);
      if (res.data.success) {
        setClient(res.data.data);
      } else {
        setError('ক্লায়েন্ট পাওয়া যায়নি। মোবাইল নম্বর চেক করুন।');
      }
    } catch (err) {
      setError('সার্ভার এরর অথবা নেটওয়ার্ক সমস্যা।');
    } finally {
      setLoading(false);
    }
  };

  // এডমিন: ডাটা ইম্পোর্ট ফাংশন
  const handleImport = async () => {
    if (!jsonInput) return alert('JSON ডাটা দিন');
    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonInput);
      const res = await axios.post(`${API_URL}/clients/import`, { clients: parsedData });
      alert(res.data.message);
      setJsonInput('');
    } catch (err) {
      alert('ইম্পোর্ট ব্যর্থ! সঠিক JSON ফরম্যাট দিন।');
    } finally {
      setLoading(false);    }
  };

  // এডমিন: স্ট্যাটাস দেখা
  const loadStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* হেডার */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#0056b3' }}>📡 ISP Portal</h2>
        <div>
          <button onClick={() => setView('home')} style={navBtn}>হোম</button>
          <button onClick={() => { setView('admin'); loadStats(); }} style={navBtn}>এডমিন</button>
        </div>
      </div>

      {/* হোম পেজ - কাস্টমার সার্চ */}
      {view === 'home' && (
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>🔍 আপনার অ্যাকাউন্ট খুঁজুন</h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="tel" 
                placeholder="মোবাইল নম্বর (017XXXXXXXX)" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
              <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {loading ? '...' : 'খুঁজুন'}
              </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>

          {/* ক্লায়েন্ট কার্ড */}
          {client && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderTop: '4px solid #28a745' }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>👤 {client.clientName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>                <div><strong>প্যাকেজ:</strong> {client.package}</div>
                <div><strong>স্পিড:</strong> {client.speed}</div>
                <div><strong>মাসিক বিল:</strong> ৳ {client.monthlyBill}</div>
                <div><strong>স্ট্যাটাস:</strong> <span style={{ color: client.status === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>{client.status}</span></div>
                <div><strong>মেয়াদ শেষ:</strong> {client.expiryDate}</div>
                <div><strong>বাকি দিন:</strong> <span style={{ color: client.remainingDays === 'Expired' ? 'red' : 'green' }}>{client.remainingDays}</span></div>
                <div style={{ gridColumn: '1 / -1' }}><strong>ঠিকানা:</strong> {client.zone} {client.subZone}, {client.address}</div>
              </div>
              <button onClick={() => window.print()} style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🖨️ প্রিন্ট করুন</button>
            </div>
          )}
        </div>
      )}

      {/* এডমিন পেজ */}
      {view === 'admin' && (
        <div>
          <h3>📊 এডমিন ড্যাশবোর্ড</h3>
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalClients}</div>
                <div>মোট ক্লায়েন্ট</div>
              </div>
              <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>৳ {stats.totalRevenue}</div>
                <div>মোট আয়</div>
              </div>
            </div>
          )}
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
            <h4>📥 ডাটা ইম্পোর্ট (JSON)</h4>
            <p style={{ fontSize: '12px', color: '#666' }}>Excel থেকে JSON কনভার্ট করে এখানে পেস্ট করুন</p>
            <textarea 
              rows="5" 
              placeholder='[{"SrNo":"1", "Client Name":"Test", ...}]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '10px' }}
            />
            <button onClick={handleImport} disabled={loading} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
              {loading ? 'প্রসেস হচ্ছে...' : 'ইম্পোর্ট করুন'}
            </button>
          </div>
        </div>
      )}

    </div>
  );}

const navBtn = {
  background: 'transparent',
  border: '1px solid #0056b3',
  color: '#0056b3',
  padding: '5px 10px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginLeft: '5px'
};

export default App;
