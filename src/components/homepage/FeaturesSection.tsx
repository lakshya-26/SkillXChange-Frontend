import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Video,
  Shield,
  Trophy,
  Brain,
  Globe,
} from "lucide-react";
import Button from "../ui/Button";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Skill Discovery",
      description:
        "Find the perfect skill exchange partner with our AI-powered matching system that considers your interests, location, and availability.",
      gradient: "from-blue-500 to-cyan-500",
      image:
        "https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/feature-search_ucmzmn.png",
    },
    {
      icon: MessageSquare,
      title: "Real-time Messaging",
      description:
        "Connect instantly with potential partners through our secure, real-time chat system. Schedule sessions and coordinate seamlessly.",
      gradient: "from-green-500 to-emerald-500",
      image:
        "https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/feature-messaging_jktufj.png",
    },
    {
      icon: Video,
      title: "HD Video Calls",
      description:
        "Experience crystal-clear video calls with screen sharing capabilities. Learn and teach from anywhere in the world.",
      gradient: "from-purple-500 to-pink-500",
      image:
        "https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/feature-video_c1gjmk.png",
    },
    {
      icon: Shield,
      title: "Blockchain Reputation",
      description:
        "Build trust with our immutable reputation system. Every exchange is recorded on the blockchain for complete transparency.",
      gradient: "from-orange-500 to-red-500",
      image:
        "https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/feature-blockchain_os0xos.png",
    },
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description:
        "Our advanced AI analyzes your profile and learning goals to suggest the most compatible skill exchange partners.",
      gradient: "from-indigo-500 to-purple-500",
      image:
        "https://res.cloudinary.com/dca9jrn70/image/upload/v1757441909/ai-pwered-matching_ryojq0.png",
    },
    {
      icon: Trophy,
      title: "Gamification & Rewards",
      description:
        "Earn points, badges, and certificates for your teaching and learning achievements. Level up your skill-sharing journey!",
      gradient: "from-yellow-500 to-orange-500",
      image:
        "https://res.cloudinary.com/dca9jrn70/image/upload/v1757440583/community-forum_kdsbfb.png",
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-6"
          >
            <Globe className="w-4 h-4 mr-2" />
            Powerful Features
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {" "}
              Exchange Skills
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to find
            partners, communicate effectively, and build lasting learning
            relationships.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                {/* Feature Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  {/* Icon Overlay */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <feature.icon className="w-6 h-6 text-gray-700" />
                  </div>
                </div>

                {/* Feature Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-8">
            Ready to start your skill exchange journey?
          </p>
          <Button
            to="/signup"
            variant="transparent"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Explore All Features
            </motion.button>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
