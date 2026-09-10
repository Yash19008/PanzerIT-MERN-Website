import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { SolutionsGrid } from "@/components/frontend/SolutionsGrid";
import Image from "next/image";
import { Metadata } from 'next';
import { getSeoData, getBreadcrumbData } from '@/app/admin/settings/seo/seoStore';
import ServiceContactForm from "@/components/frontend/ServiceContactForm";
import { createPageMetadata } from '@/utils/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getSeoData('seo_solution');
    return createPageMetadata(seo, '/solution');
}

export default async function Page() {
    const bc = await getBreadcrumbData('breadcrumb_solution_list');
    return (
        <>
            <Breadcrumb
                title={bc.title || "Cyber Security, Data Protection & Compliance"}
                paths={[{ "name": "Solutions" }]}
                description={bc.description || "Identity Management, Data Leak Prevention, Backup & Disaster Recovery, Employee Monitoring, Endpoint Security and Cyber Security Consultancy Services."}
                image={bc.image || undefined}
                imageAlt={bc.imageAlt || undefined}
            />

            <section className="tv-service-section space-bottom inner style-2 bg-light pt-100 ">
                <div className="tv-service-inner position-relative overflow-hidden mx-30 ml-mx-0">
                    <div className="container">

                        <div className="row">
                            <div className="col-lg-12 text-center">
                                <div className="title-wrap two white" data-wow-duration="2s" data-wow-delay=".0s">
                                    <div className="sub-title-2">Solutions</div>
                                    <h2 className="sec-title text-dark no-title-animation">Security Solutions Designed Around Risk, Compliance & Business Continuity</h2>
                                    <p className="sec-desc text-dark mt-15">Protect users, endpoints, servers, cloud workloads and business data through integrated cybersecurity, monitoring, backup and disaster recovery solutions.</p>
                                </div>
                            </div>
                        </div>
                        <SolutionsGrid />
                    </div>
                </div>
            </section>

            <section className="tv-process-section bg-light position-relative">
                <div className="p-top-center z-1 wow slideInTop">
                    <Image src="/assets/images/process/hm1-shape01.png" alt="Decorative process graphic" width={1026} height={295} sizes="100vw" style={{ width: "100%", height: "auto" }} />
                </div>
                <div className="process-inner bg-theme3  mx-30 ml-mx-0 br_bl-30 br_br-30 ml-br-0  space  overflow-hidden xxl-br-0 position-relative">
                    <div className="container position-relative">

                        <div className="row">
                            <div className="col-lg-12">
                                <div className="process-title mt--25">
                                    <h2 className="text-white text-center">HOW WE WORK</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row gy-30">
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item wow fadeInRightBig" data-wow-delay=".2s">
                                    <h4 className="title-text">STEP 01</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon1.webp" alt="Discover step icon" width={40} height={42} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Discover</h3>
                                        <p>Understand infrastructure, risks, compliance requirements and business objectives.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item wow fadeInRightBig" data-wow-delay=".3s">
                                    <h4 className="title-text">STEP 02</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon2.webp" alt="Design step icon" width={44} height={44} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Design</h3>
                                        <p>Recommend the right mix of cybersecurity, backup, identity and monitoring solutions.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item  wow fadeInRightBig" data-wow-delay=".4s">
                                    <h4 className="title-text">STEP 03</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon3.webp" alt="Implement step icon" width={46} height={46} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Implement</h3>
                                        <p>Deploy, configure and integrate technologies with existing IT environments.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="tv-process-item wow fadeInRightBig" data-wow-delay=".5s">
                                    <h4 className="title-text">STEP 04</h4>
                                    <div className="process-box">
                                        <div className="icon"><Image src="/assets/images/process/hm1-icon4.webp" alt="Protect and Support step icon" width={35} height={45} sizes="100vw" style={{ width: "100%", height: "auto" }} /></div>
                                        <h3 className="title">Protect & Support</h3>
                                        <p>Continuous monitoring, optimization, updates and incident response assistance.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* <section className="tv-contact-section style-4 z-1">
                <div className="tv-contact-inner space position-relative overflow-hidden bg-light2 mx-20 ml-mx-0">
                    <div className="container">
                        <div className="row gy-30 contact-wrapper align-items-stretch">
                            <div className="col-lg-6">
                                <div className="contact-right-content">
                                    <div className="title-wrap text-center">
                                        <div className="sub-title-2 text-theme">Contact
                                            Us</div>
                                        <h2 className="sec-title no-title-animation">Feel free to touch base <br /> with Panzer IT</h2>
                                    </div>
                                    <div className="contact-form style-4">
                                        <ServiceContactForm />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="contact-left-thumb overflow-hidden">
                                    <figure className="panzer-static-img">
                                        <Image src="/assets/images/hero/deal.png" alt="Business deal discussion" width={1254} height={1254} sizes="100vw" style={{ width: "100%", height: "auto" }} />
                                    </figure>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
            {/* Industries We Serve Section */}
            <section className="panzer-industries-section space position-relative" style={{ background: 'var(--bs-bg-color24)', padding: '60px 0' }}>
                <style>{`
                    .panzer-sol-industries-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 20px;
                    }
                    @media (max-width: 1199px) {
                        .panzer-sol-industries-grid {
                            grid-template-columns: repeat(3, 1fr);
                        }
                    }
                    @media (max-width: 575px) {
                        .panzer-sol-industries-grid {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                `}</style>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-wrap text-center mb-50">
                                <h2 className="sec-title no-title-animation" style={{ fontSize: '36px', color: 'var(--theme-navy-dark)', fontWeight: 700 }}>
                                    Industries we serve
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="panzer-sol-industries-grid">
                        {[
                            { title: "BFSI and NBFC", icon: "fa-solid fa-building-columns", focus: "RBI compliance, DLP and IAM, Backup" },
                            { title: "Manufacturing", icon: "fa-solid fa-gears", focus: "OT security, Endpoint protection, Backup" },
                            { title: "Export houses", icon: "fa-solid fa-ship", focus: "Data protection, Email security, DLP" },
                            { title: "Healthcare", icon: "fa-solid fa-stethoscope", focus: "Patient data security, Backup, Compliance" },
                            { title: "Education", icon: "fa-solid fa-graduation-cap", focus: "Identity management, Endpoint security" },
                            { title: "Government and PSU", icon: "fa-solid fa-landmark", focus: "Compliance, Access control, Monitoring" },
                            { title: "IT and SaaS", icon: "fa-solid fa-cloud", focus: "Cloud security, IAM and PAM, EDR" },
                            { title: "MSPs and integrators", icon: "fa-solid fa-network-wired", focus: "Multi-tenant security solutions" },
                            { title: "Logistics and supply chain", icon: "fa-solid fa-truck-fast", focus: "Availability, Backup, Endpoint security" },
                            { title: "Retail and e-commerce", icon: "fa-solid fa-cart-shopping", focus: "Customer data protection, Monitoring" },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="panzer-industry-card d-flex flex-column align-items-center justify-content-center text-center"
                                style={{
                                    background: 'var(--bs-bg-color23)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '28px 16px',
                                    minHeight: '185px',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <div
                                    className="panzer-industry-icon-circle d-flex align-items-center justify-content-center flex-shrink-0 mb-3"
                                    style={{
                                        width: '54px',
                                        height: '54px',
                                        borderRadius: '50%',
                                        background: 'var(--theme-color)',
                                        color: 'var(--white-color)',
                                    }}
                                >
                                    <i className={item.icon} style={{ fontSize: '22px' }}></i>
                                </div>
                                <span
                                    style={{
                                        color: 'var(--dark-color)',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        lineHeight: 1.35,
                                    }}
                                >
                                    {item.title}
                                </span>
                                <span
                                    style={{
                                        color: 'var(--body-color)',
                                        fontSize: '13px',
                                        fontWeight: 400,
                                        lineHeight: 1.4,
                                        marginTop: '6px',
                                    }}
                                >
                                    {item.focus}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
