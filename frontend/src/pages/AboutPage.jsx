import { Music, Users, Play, Lock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden backdrop-blur-lg">
      {/* Overlay for slight contrast */}
      <div className="absolute inset-0"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center space-y-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content mt-12 sm:mt-20">
          Rreth <span className="text-primary">TingulLive</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-base-content max-w-3xl mx-auto mt-4">
          TingulLive është rezultat i punimit te diplomës në Bachelor në Inxhinieri Informatike. 
          Idenë për këtë platformë e kam pasur duke vëzhguar mënyrën sesi miqtë e mi dhe unë dëshironim 
          të dëgjonim muzikë së bashku në distancë, sidomos gjatë periudhave kur nuk mund të ishim fizikisht 
          bashkë. Qëllimi ka qenë të krijoja një mënyrë të thjeshtë dhe argëtuese për të ndarë muzikën në kohë reale.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-base-content max-w-3xl mx-auto">
          Projekti kombinon integrimin me Spotify, dhoma të personalizueshme për dëgjim në grup, dhe një sistem chat-i live për të komunikuar ndërsa muzikë dëgjohet. Ideja ishte të lehtësonim përvojën e dëgjimit të përbashkët, duke ruajtur sinkronizimin e saktë të këngëve për të gjithë pjesëmarrësit.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 px-4 sm:px-0">
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <Music className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl text-primary">Integrimi me Spotify</h2>
              <p className="text-sm sm:text-base">Kontrolloni muzikën direkt në room duke përdorur llogarinë tuaj Spotify.</p>
            </div>
          </div>
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <Users className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl text-primary">Dëgjim në Grup</h2>
              <p className="text-sm sm:text-base">Ftoni miqtë dhe sinkronizoni këngët menjëherë — pa vonesa dhe pa komplikime.</p>
            </div>
          </div>
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <Play className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl text-primary">Riprodhim në Kohë Reale</h2>
              <p className="text-sm sm:text-base">Ndalo, kaloni ose luani këngët dhe të gjithë dëgjojnë saktësisht të njëjtën muzikë.</p>
            </div>
          </div>
          <div className="card bg-base-100/80 shadow-xl p-4 sm:p-6 rounded-xl">
            <div className="card-body items-center text-center text-base-content">
              <Lock className="w-10 h-10 text-primary mb-2" />
              <h2 className="card-title text-lg sm:text-xl text-primary">Dhoma Publike</h2>
              <p className="text-sm sm:text-base">Krijoni sesione private ose dhoma të hapura që kushdo mund t'i bashkohet.</p>
            </div>
          </div>
        </div>

        {/* Closing Note */}
        <p className="mt-10 text-base-content text-base sm:text-lg">
          TingulLive synon të bëjë dëgjimin e muzikës një përvojë sociale dhe argëtuese, pavarësisht distancës mes përdoruesve.
        </p>

        {/* Extra padding at the bottom */}
        <div className="h-16" />
      </div>
    </div>
  );
}
