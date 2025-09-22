import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import Button from "../ui/Button";

const CTASection: React.FC = () => {
  const benefits = [
    "Free to join and start exchanging skills",
    "AI-powered matching for perfect partners",
    "Secure blockchain-based reputation system",
    "Real-time video calls and messaging",
    "Global community of learners and teachers",
    "Earn rewards and build your portfolio",
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-green-900/20" />
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                {" "}
                Skill Journey?
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of people who are already exchanging skills,
              building connections, and transforming their learning experience.
              Your next skill exchange partner is waiting!
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white border-0"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                to="/signup"
                variant="outline"
                size="lg"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
              {/* Mock App Interface */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        SkillXChange
                      </div>
                      <div className="text-gray-400 text-sm">
                        Find your next skill
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>

                {/* Search Bar */}
                <div className="bg-gray-700 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-2">
                    Search for skills
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "70%" }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                    </div>
                    <div className="text-blue-400 text-sm font-medium">70%</div>
                  </div>
                </div>

                {/* Skill Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      skill: "Guitar",
                      match: "95%",
                      color: "from-green-500 to-emerald-500",
                    },
                    {
                      skill: "Cooking",
                      match: "88%",
                      color: "from-orange-500 to-red-500",
                    },
                    {
                      skill: "Photography",
                      match: "82%",
                      color: "from-purple-500 to-pink-500",
                    },
                    {
                      skill: "Yoga",
                      match: "79%",
                      color: "from-blue-500 to-cyan-500",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-white`}
                    >
                      <div className="font-semibold mb-1">{item.skill}</div>
                      <div className="text-sm opacity-90">
                        {item.match} match
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  to="/signup"
                  variant="transparent"
                  baseClassRequired={false}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Exchanging Skills
                  </motion.button>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
