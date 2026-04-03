import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Map as MapIcon, Globe2, Activity, ShieldAlert, Server, Workflow, Laptop, FileCode2, Network } from "lucide-react";
import Globe from "./components/Globe";
import InteractiveMap from "./components/InteractiveMap";

export default function App() {
  const [ip, setIp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [error, setError] = useState("");
  const [errorTitle, setErrorTitle] = useState("");

  const handleTrack = async (e?: React.FormEvent, directIp?: string) => {
    if (e) e.preventDefault();
    const targetIp = directIp !== undefined ? directIp : ip;
    if (!targetIp && e) return; // Only return if empty on explicit submit

    setIsLoading(true);
    setError("");
    setErrorTitle("");
    setGeoData(null);

    // Call Flask backend instead of standard Next.js path
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: targetIp }),
      });
      const data = await res.json();
      
      if (data.status === "success") {
        setGeoData(data);
        setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 300);
      } else {
        setErrorTitle("Tracking Failed");
        setError(data.message || "Invalid IP Address or Data Unavailable.");
      }
    } catch (err) {
      setErrorTitle("Backend Connection Failed");
      setError("An error occurred while communicating with the Flask backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const trackMyIp = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setIp(data.ip);
      handleTrack(undefined, data.ip);
    } catch (e) {
      setIp("127.0.0.1");
      handleTrack(undefined, "127.0.0.1");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
              <Globe2 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Geo<span className="text-blue-400">Track</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="#results" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Results</a>
            <a href="#concepts" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Network Concepts</a>
          </div>
          <a href="#hero" className="hidden md:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
            Track IP
          </a>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO */}
        <section id="hero" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 w-full h-full -z-10">
            <Globe />
          </div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
              <Activity size={16} className="animate-pulse" />
              <span>Flask & Vite Architecture</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Trace Any IP Address <br className="hidden md:block"/>
              <span className="text-gradient">Across the Globe</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10">
              Instantly geolocate any IP address and visualize its physical location on an interactive map. Powered by React, Flask, and Real-Time API integration.
            </motion.p>

            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onSubmit={handleTrack} className="w-full max-w-xl relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Search size={22} />
              </div>
              <input 
                type="text" 
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Enter IP address (e.g. 8.8.8.8)" 
                className="w-full h-16 bg-brand-glass backdrop-blur-xl border border-brand-border rounded-2xl pl-12 pr-40 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg shadow-xl"
                required
              />
              <button disabled={isLoading} className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Track IP"}
              </button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
              <button type="button" onClick={trackMyIp} className="px-4 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-500/40 text-blue-400 font-semibold transition-colors border border-blue-500/30 flex items-center gap-2">
                <Laptop size={14} /> My IP
              </button>
              <div className="w-px h-5 bg-white/10 mx-1"></div>
              <span>Presets:</span>
              {["8.8.8.8", "1.1.1.1", "127.0.0.1", "2606:4700:4700::1111"].map((exIp) => (
                <button key={exIp} type="button" onClick={(e) => { setIp(exIp); handleTrack(e, exIp); }} className="px-3 py-1 rounded-full bg-brand-border/30 hover:bg-blue-500/20 hover:text-blue-400 transition-colors border border-brand-border">
                  {exIp}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* RESULTS */}
        <AnimatePresence>
          {(geoData || error) && (
            <section id="results" className="py-24 px-6 relative z-10 border-t border-white/5">
              <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Location <span className="text-gradient">Intelligence</span></h2>
                  <p className="text-slate-400">Geolocation data for <strong className="text-white">{geoData ? geoData.query : ip}</strong></p>
                </motion.div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 border-red-500/30 text-center max-w-md mx-auto">
                    <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-red-400 mb-2">{errorTitle || "Error"}</h3>
                    <p className="text-slate-300">{error}</p>
                  </motion.div>
                )}

                {geoData && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                      {[
                        { label: "IP Address", value: geoData.query, icon: Network },
                        { label: "Country", value: geoData.country, icon: Globe2 },
                        { label: "Region", value: geoData.regionName, icon: MapIcon },
                        { label: "City", value: geoData.city, icon: MapIcon },
                        { label: "ISP", value: geoData.isp, icon: Server },
                        { label: "Coordinates", value: `${geoData.lat}, ${geoData.lon}`, icon: Activity },
                      ].map((stat, i) => (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={stat.label} className="glass-card p-5 col-span-2 sm:col-span-1 lg:col-span-2">
                          <stat.icon className="text-blue-400 mb-3" size={24} />
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">{stat.label}</p>
                          <p className="text-lg font-bold text-white break-all">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card overflow-hidden h-[400px] lg:h-auto min-h-[400px] relative border-brand-border">
                      <div className="absolute top-0 left-0 right-0 p-4 bg-brand-dark/80 backdrop-blur-md z-[400] flex items-center gap-3 border-b border-brand-border">
                        <MapIcon size={20} className="text-blue-400" />
                        <span className="font-semibold text-sm tracking-wide">Interactive Map View</span>
                      </div>
                      <InteractiveMap lat={geoData.lat} lon={geoData.lon} city={geoData.city} />
                    </motion.div>
                  </div>
                )}
              </div>
            </section>
          )}
        </AnimatePresence>

        {/* CONCEPTS */}
        <section id="concepts" className="py-24 px-6 bg-gradient-to-b from-transparent to-brand-dark relative z-10 border-t border-brand-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold tracking-widest uppercase mb-4">Knowledge Base</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Network <span className="text-gradient">Concepts</span></h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Core networking principles and architecture powering this assignment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "IP Addressing", desc: "Every device is assigned a unique IP address to enable network routing.", icon: Laptop, tag: "Layer 3" },
                { title: "Vite + React Frontend", desc: "Our Client Interface handles interactive 3D WebGL rendering and state management efficiently.", icon: Server, tag: "Client" },
                { title: "Flask Backend", desc: "The secure Python web server processing requests, managing CORS, and serving the static bundle to Render.", icon: Workflow, tag: "Server" },
                { title: "RESTful API", desc: "Our Flask backend exposes a custom JSON API endpoint (/api/track) seamlessly integrating with ip-api.com.", icon: FileCode2, tag: "Integration" },
              ].map((concept, i) => (
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={concept.title} className="glass-card p-8 group relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <concept.icon size={36} className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold text-white mb-3">{concept.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">{concept.desc}</p>
                  <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-xs font-semibold text-indigo-300">{concept.tag}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-dark border-t border-brand-border pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>© 2026 GeoTrack | Built with React + Flask | deployed on Render</p>
        </div>
      </footer>
    </div>
  );
}
