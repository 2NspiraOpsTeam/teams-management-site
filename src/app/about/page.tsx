import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      
      {/* Hero */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold text-slate-900 mb-4">
            About Teams Management
          </h1>
          <p className="text-lg text-slate-600">
            Establishing excellence in property stewardship across New York City.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed">
              Founded with a commitment to exceptional property management, Teams Management 
              brings over two decades of industry expertise to New York City's most prestigious 
              properties. We operate as The Property Steward – established, premium, calm, reliable, 
              and organized.
            </p>

            <h2 className="text-2xl font-serif font-semibold text-slate-900 mt-12 mb-6">
              Our Approach
            </h2>

            <p className="text-slate-600 leading-relaxed">
              We believe that great property management is more than maintenance and billing. 
              It's about creating communities where residents can thrive, properties maintain their value, 
              and operations run smoothly in the background. Our team understands the unique demands 
              of Manhattan living – from pre-war building quirks to modern high-rise amenities.
            </p>

            <h2 className="text-2xl font-serif font-semibold text-slate-900 mt-12 mb-6">
              What We Manage
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Our portfolio includes residential towers, luxury condominiums, and boutique 
              buildings across Manhattan and Brooklyn. Each property receives personalized attention 
              while operating within scalable systems that ensure consistency and accountability.
            </p>

            <h2 className="text-2xl font-serif font-semibold text-slate-900 mt-12 mb-6">
              Our Values
            </h2>

            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="text-slate-400 mr-3 mt-1">✓</span>
                <span><strong>Excellence:</strong> We pursue industry-leading standards in every aspect of property management.</span>
              </li>
              <li className="flex items-start">
                <span className="text-slate-400 mr-3 mt-1">✓</span>
                <span><strong>Transparency:</strong> Open communication with residents and building owners.</span>
              </li>
              <li className="flex items-start">
                <span className="text-slate-400 mr-3 mt-1">✓</span>
                <span><strong>Stewardship:</strong> Protecting and enhancing property values through proactive care.</span>
              </li>
              <li className="flex items-start">
                <span className="text-slate-400 mr-3 mt-1">✓</span>
                <span><strong>Community:</strong> Fostering environments where neighbors know and support each other.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-serif font-semibold text-slate-900 mt-12 mb-6">
              Leadership
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Our founding team includes former building superintendents, licensed real estate professionals, 
              and operational experts who understand what makes New York property management unique. 
              We're dedicated to continuous improvement and emerging best practices.
            </p>

            <div className="mt-12 p-6 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 italic">
                [Leadership team bio placeholders - add individual profiles with professional photographs before launch]
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
