import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Button from "../ui/Button";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img
              src="https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/skillXchange_logo_dnil4a.png"
              alt="SkillXChange Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SkillXChange
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <motion.a
              href="#features"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Features
            </motion.a>
            <motion.a
              href="#how-it-works"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              How It Works
            </motion.a>
            <motion.a
              href="#community"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Community
            </motion.a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              to="/login"
              variant="ghost"
              size="sm"
            >
              Login
            </Button>
            <Button
              to="/signup"
              variant="primary"
              size="sm"
            >
              Sign Up
            </Button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block text-gray-700 hover:text-blue-600 font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-gray-700 hover:text-blue-600 font-medium"
              >
                How It Works
              </a>
              <a
                href="#community"
                className="block text-gray-700 hover:text-blue-600 font-medium"
              >
                Community
              </a>
              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  to="/login"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Login
                </Button>
                <Button
                  to="/signup"
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
