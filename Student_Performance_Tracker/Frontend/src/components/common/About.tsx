import React, { useState } from 'react';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Send,
    Star,
    Quote
} from 'lucide-react';

import subha from './profiles/subha.jpg'
import subham from './profiles/bikala.jpg'
import laxmi from './profiles/laxmi.jpg'
import snehasis from './profiles/snehasis.jpg'

interface TeamMember {
    id: number;
    name: string;
    position: string;
    image: string;
    socialLinks: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
    };
}

interface Testimonial {
    id: number;
    name: string;
    company: string;
    text: string;
    rating: number;
}

function AboutUS() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const teamMembers: TeamMember[] = [
        {
            id: 1,
            name: 'Subhasmita',
            position: 'Founder & Managing Director',
            image: subha,
            socialLinks: {
                facebook: '#',
                twitter: '#',
                instagram: '#',
                linkedin: '#',
                youtube: '#'
            }
        },
        {
            id: 2,
            name: 'Subham',
            position: 'Senior Project Manager',
            image: subham,
            socialLinks: {
                facebook: '#',
                twitter: '#',
                instagram: '#',
                linkedin: 'https://www.linkedin.com/in/subham-swateek-panigrahi-84967a242 ',
                youtube: '#'
            }
        },
        {
            id: 3,
            name: 'Rajalaxmi',
            position: 'Lead Structural Engineer',
            image: laxmi,
            socialLinks: {
                facebook: '#',
                twitter: '#',
                instagram: '#',
                linkedin: '#',
                youtube: '#'
            }
        },
        {
            id: 4,
            name: 'Snehasis',
            position: 'Database Administrator',
            image: snehasis,
            socialLinks: {
                facebook: '#',
                twitter: '#',
                instagram: '#',
                linkedin: '#',
                youtube: '#'
            }
        }
    ];

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: 'Sarah Johnson',
            company: 'Johnson Properties',
            text: 'Working with EduManage was exceptional. Their attention to detail and professional approach made our commercial project a huge success.',
            rating: 5
        },
        {
            id: 2,
            name: 'Michael Chen',
            company: 'Chen Developments',
            text: 'The team delivered our residential complex ahead of schedule and within budget. Highly recommend their services.',
            rating: 5
        },
        {
            id: 3,
            name: 'Amanda Rodriguez',
            company: 'Rodriguez Construction',
            text: 'Their expertise in structural engineering is unmatched. They solved complex challenges with innovative solutions.',
            rating: 5
        }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Handle form submission here
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <header className="bg-gradient-to-br from-orange-50 to-yellow-50 py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            Meet the Experts Behind EduManage
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our strength lies in our people. At EduManage, we've brought together a skilled team of experts with deep industry knowledge and an unwavering commitment to excellence in every project we undertake.
                        </p>
                    </div>

                    {/* Team Members */}
                    <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            >
                                <div className="aspect-square overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>


                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                                    <p className="text-gray-600 mb-4">{member.position}</p>
                                    <div className="flex space-x-3">
                                        {member.socialLinks.facebook && (
                                            <a href={member.socialLinks.facebook} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <Facebook className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.socialLinks.twitter && (
                                            <a href={member.socialLinks.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                                                <Twitter className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.socialLinks.instagram && (
                                            <a href={member.socialLinks.instagram} className="text-gray-400 hover:text-pink-500 transition-colors">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.socialLinks.linkedin && (
                                            <a href={member.socialLinks.linkedin} className="text-gray-400 hover:text-blue-700 transition-colors">
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.socialLinks.youtube && (
                                            <a href={member.socialLinks.youtube} className="text-gray-400 hover:text-red-600 transition-colors">
                                                <Youtube className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Project Form Section */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            Get Started
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Start Your Project With Us
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Let's build something great together. Whether you need a commercial space or residential project, our team is ready to guide you every step of the way.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Construction Image */}
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src='https://images.pexels.com/photos/4816921/pexels-photo-4816921.jpeg'
                                    alt="Construction site with crane"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-[#0bf70d] text-white px-6 py-3 rounded-xl shadow-lg">
                                <div className="text-2xl font-bold">25+</div>
                                <div className="text-sm">Years Experience</div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send a message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <textarea
                                        name="message"
                                        placeholder="Type Here"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                        required
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-600">
                                        I agree to the Terms of service
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#0bf70d] hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
                                >
                                    <span>Submit</span>
                                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Testimonials
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            What Our Clients Say
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We're proud to be trusted by various clients and have earned testimonials and referrals that reflect what they have to say about working with our team and the projects we deliver.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-lg transition-all duration-300">
                                <Quote className="w-8 h-8 text-orange-500 mb-4" />
                                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.text}</p>
                                <div className="flex items-center space-x-2 mb-4">
                                    {renderStars(testimonial.rating)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-400">
                        © 2025 EduManage Construction. All rights reserved. Built with excellence and precision.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default AboutUS;