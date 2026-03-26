import { Menu } from "lucide-react";

export default function Navbar({ onMenuToggle }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-18 bg-white flex items-center justify-between px-4 md:px-8 shadow-lg z-50 border-b border-slate-200">
      {/* <nav className="fixed top-0 left-0 right-0 h-18 bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-between px-4 md:px-8 shadow-lg z-50"> */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition"
        >
          <Menu size={28} />
        </button>
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 flex items-center justify-center">
            {/* <div className="w-25 h-17 rounded-full bg-white text-purple-700 flex items-center justify-center font-bold"> */}
            <img
              src="peepalvetlogo.jpeg"
              alt="Peepal Vets Logo"
              // className="w-15 h-12"
              className="w-10 h-10 flex items-center justify-center"
            />
          </div>
          <div>
            <h1 className="text-lg md:text-3xl font-bold text-slate-900">
              Peepal Vets
            </h1>
            <p className="text-xs text-slate-500">Veterinary Clinic</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">
            Dr. Vaibhav Devidas Wagh
          </p>
          <p className="text-xs text-slate-500">
            peepalvetspetclinic@gmail.com
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
          V
        </div>
      </div>
    </nav>
  );
}
