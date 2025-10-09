import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const StatsSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { value: 50000, label: "Active Users", suffix: "+" },
    { value: 100000, label: "Skills Exchanged", suffix: "+" },
    { value: 95, label: "Success Rate", suffix: "%" },
    { value: 150, label: "Countries", suffix: "+" },
  ];

  const AnimatedCounter = ({
    value,
    suffix,
  }: {
    value: number;
    suffix: string;
  }) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
      if (isInView) {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }
    }, [isInView, value]);

    return (
      <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 to-green-600 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Growing Global Community
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Join thousands of learners and teachers from around the world who
            are transforming the way we share knowledge
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mb-4">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-lg lg:text-xl font-medium opacity-90">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-2xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Platform Availability</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-2xl font-bold mb-2">50+</div>
              <div className="opacity-90">Skill Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-2xl font-bold mb-2">4.9★</div>
              <div className="opacity-90">User Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
