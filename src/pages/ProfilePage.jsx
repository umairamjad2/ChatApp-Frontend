import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Img = reader.result;
      await updateProfile({
        profilePic: base64Img,
        fullName: name,
        bio,
      });
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-black overflow-hidden">
      {/* Blurred Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: "url('/bgImage.svg')",
          filter: "blur(80px)",
          opacity: "0.6"
        }}
      ></div>

      <div className="relative w-full max-w-3xl bg-[#1a1429]/60 backdrop-blur-3xl text-gray-200 border border-white/10 flex flex-col md:flex-row items-center justify-between rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
        
        {/* LEFT FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 p-8 sm:p-12 flex-1 w-full order-2 md:order-1"
        >
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Profile Details</h2>
            <p className="text-sm text-gray-400">Update your personal information</p>
          </div>

          <label
            htmlFor="avatar"
            className="flex items-center gap-4 cursor-pointer group w-max"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <div className="relative">
              <img
                src={
                  selectedImg
                    ? URL.createObjectURL(selectedImg)
                    : authUser?.profilePic || assets.avatar_icon
                }
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-violet-400 transition-all"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xl">+</span>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              Change avatar
            </span>
          </label>

          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs text-gray-400 ml-1 mb-1 block">Full Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                value={name}
                className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 ml-1 mb-1 block">Bio</label>
              <textarea
                onChange={(e) => setBio(e.target.value)}
                value={bio}
                placeholder="Write a short bio about yourself..."
                required
                className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 text-white placeholder-gray-500 transition-all resize-none"
                rows={4}
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white py-3.5 rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            Save Changes
          </button>
        </form>

        {/* RIGHT SIDE IMAGE */}
        <div className="flex items-center justify-center p-8 sm:p-12 w-full md:w-1/2 order-1 md:order-2 relative">
          <div className="relative flex items-center justify-center w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/40 blur-[80px] rounded-full"></div>
            <img
              src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)}
              alt="Profile Preview"
              className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover ring-4 ring-white/10 shadow-[0_0_40px_rgba(139,92,246,0.3)] relative z-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
