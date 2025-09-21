import { Music, Users, Play, MessageCircleDashed } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
    <div className="h-6"/>
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videoHome.mp4"
        autoPlay
        loop
        muted
      ></video>

      <div className="absolute inset-0 bg-black/50"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl text-center space-y-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mt-12 sm:mt-20">
          Ky është <span className="text-primary">tingulLive</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
          Me TingulLive mund të <span className="font-semibold">dëgjoni së bashku</span>{" "}
          me miqtë tuaj në kohë reale. Krijoni dhoma, sinkronizoni muzikën tuaj me Spotify
          dhe bisedoni live duke zbuluar muzikë.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 px-4 sm:px-0">
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <Music className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl">Integrimi i Spotify</h2>
              <p className="text-sm sm:text-base">Kontrollo muzikën direkt përmes dhomave live.</p>
            </div>
          </div>
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <Users className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl">Dëgjim në grup</h2>
              <p className="text-sm sm:text-base">Fto miqtë dhe dëgjoni së bashku muzikë, pa lodhje apo vonesa.</p>
            </div>
          </div>
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <Play className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl">Dëgjim në kohë reale</h2>
              <p className="text-sm sm:text-base">Blloko ose hap zërin, fol apo luaj një këngë, të gjitha menjëherë.</p>
            </div>
          </div>
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <MessageCircleDashed className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl">Mesazhe direkte</h2>
              <p className="text-sm sm:text-base">Komuniko me miqtë pa u larguar nga aplikacioni</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
          <Link to="/signup" className="btn btn-primary w-full sm:w-auto">
            Rregjistrohu
          </Link>
          <Link to="/login" className="btn btn-default w-full sm:w-auto">
            Logohu
          </Link>
        </div>

        {/* Extra padding after buttons */}
        <div className="h-16" />
      </div>
    </div>
    </>
  );
}
