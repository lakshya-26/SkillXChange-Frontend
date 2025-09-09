import React from "react";
import { motion } from "framer-motion";
import { Play, Star, Users, Clock } from "lucide-react";

const ShowcaseSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "UX Designer",
      skill: "Learned Guitar",
      quote:
        "I exchanged my UX design skills for guitar lessons. Best decision ever! The platform made it so easy to find the perfect match.",
      avatar:
        "https://ix-marketing.imgix.net/focalpoint.png?auto=format,compress&w=3038",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Chef",
      skill: "Taught Cooking",
      quote:
        "Teaching others my family recipes while learning photography has been incredible. The community is amazing!",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Software Developer",
      skill: "Learned French",
      quote:
        "Finally breaking through my language learning plateau by teaching coding. The AI matching is spot-on!",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            See It In
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {" "}
              Action
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch real users transform their skills and build meaningful
            connections
          </p>
        </motion.div>

        {/* Video Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative mb-20"
        >
          <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition-all duration-300"
              >
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </motion.button>
            </div>

            {/* Video Thumbnail Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
              <div className="text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-semibold">
                  Skill Exchange in Action
                </p>
                <p className="text-sm opacity-80">Click to watch the demo</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {testimonial.skill}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Users,
              label: "Successful Exchanges",
              value: "25,000+",
              color: "text-blue-600",
            },
            {
              icon: Clock,
              label: "Hours of Learning",
              value: "150,000+",
              color: "text-green-600",
            },
            {
              icon: Star,
              label: "Average Rating",
              value: "4.9/5",
              color: "text-yellow-600",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
