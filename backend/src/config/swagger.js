const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  apis: [], // Empty array since we're defining everything manually
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Panzer IT API',
      version: '1.0.0',
      description: 'REST API for Panzer IT cybersecurity solutions platform',
      contact: {
        name: 'Panzer IT Support',
        email: 'support@panzerit.com',
        url: 'https://panzerit.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://panzerit.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.panzerit.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: 'JWT token stored in httpOnly cookie'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@panzerit.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'editor'],
              example: 'admin'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T08:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            }
          }
        },
        Lead: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Jane Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'jane@company.com'
            },
            phone: {
              type: 'string',
              example: '+1-555-0123'
            },
            company: {
              type: 'string',
              example: 'Tech Corp'
            },
            message: {
              type: 'string',
              example: 'Interested in your cybersecurity solutions...'
            },
            source: {
              type: 'string',
              example: 'Contact Page'
            },
            status: {
              type: 'string',
              enum: ['new', 'contacted', 'qualified', 'lost'],
              example: 'new'
            },
            notes: {
              type: 'string',
              example: 'Followed up via email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            }
          }
        },
        Post: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Understanding Zero Trust Security'
            },
            slug: {
              type: 'string',
              example: 'understanding-zero-trust-security'
            },
            excerpt: {
              type: 'string',
              example: 'A comprehensive guide to implementing zero trust architecture...'
            },
            content: {
              type: 'string',
              example: '<p>Rich HTML content...</p>'
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Zero Trust Security Diagram'
                }
              }
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['security', 'zero-trust', 'architecture']
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'published'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  example: 'Understanding Zero Trust Security | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  example: 'Learn about zero trust security architecture and implementation...'
                },
                ogImage: {
                  type: 'string',
                  example: '/uploads/images/og-image.webp'
                }
              }
            },
            readTime: {
              type: 'number',
              example: 5
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            author: {
              $ref: '#/components/schemas/User'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            }
          }
        },
        Solution: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Network Security Solutions'
            },
            slug: {
              type: 'string',
              example: 'network-security-solutions'
            },
            tagline: {
              type: 'string',
              example: 'Advanced protection for modern networks'
            },
            description: {
              type: 'string',
              example: '<p>Rich HTML content...</p>'
            },
            summary: {
              type: 'string',
              example: 'Comprehensive network security solutions...'
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Network Security'
                }
              }
            },
            icon: {
              type: 'string',
              example: 'network-icon'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Firewall Management', 'Intrusion Detection', 'VPN Solutions']
            },
            category: {
              type: 'string',
              example: 'Network Security'
            },
            order: {
              type: 'number',
              example: 1
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'published'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  example: 'Network Security Solutions | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  example: 'Advanced network security solutions for enterprise protection...'
                },
                ogImage: {
                  type: 'string',
                  example: '/uploads/images/og-image.webp'
                }
              }
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            }
          }
        },
        Brand: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Cisco Systems'
            },
            slug: {
              type: 'string',
              example: 'cisco-systems'
            },
            tagline: {
              type: 'string',
              example: 'Leader in networking and security'
            },
            summary: {
              type: 'string',
              example: 'Cisco provides industry-leading networking and security solutions...'
            },
            content: {
              type: 'string',
              example: '<p>Rich HTML content...</p>'
            },
            logo: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Cisco Logo'
                }
              }
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Cisco Cover Image'
                }
              }
            },
            website: {
              type: 'string',
              format: 'uri',
              example: 'https://www.cisco.com'
            },
            category: {
              type: 'string',
              example: 'Network Security'
            },
            order: {
              type: 'number',
              example: 1
            },
            isFeatured: {
              type: 'boolean',
              example: true
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'published'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  example: 'Cisco Systems | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  example: 'Learn about Cisco networking and security solutions...'
                },
                ogImage: {
                  type: 'string',
                  example: '/uploads/images/og-image.webp'
                }
              }
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            }
          }
        },
        Download: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Cybersecurity Best Practices Guide'
            },
            slug: {
              type: 'string',
              example: 'cybersecurity-best-practices-guide'
            },
            description: {
              type: 'string',
              example: 'Comprehensive guide to implementing cybersecurity best practices...'
            },
            file: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/documents/doc-abc123.pdf'
                },
                originalName: {
                  type: 'string',
                  example: 'cybersecurity-guide.pdf'
                },
                size: {
                  type: 'number',
                  example: 2048576
                },
                mimeType: {
                  type: 'string',
                  example: 'application/pdf'
                }
              }
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Guide Cover'
                }
              }
            },
            category: {
              type: 'string',
              example: 'Whitepaper'
            },
            downloadCount: {
              type: 'number',
              example: 1250
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'published'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  example: 'Cybersecurity Best Practices Guide | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  example: 'Download our comprehensive cybersecurity best practices guide...'
                }
              }
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            }
          }
        },
        Media: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            originalName: {
              type: 'string',
              example: 'hero-image.jpg'
            },
            filename: {
              type: 'string',
              example: 'img-abc123.webp'
            },
            url: {
              type: 'string',
              example: '/uploads/images/img-abc123.webp'
            },
            alt: {
              type: 'string',
              example: 'Hero image for homepage'
            },
            caption: {
              type: 'string',
              example: 'Modern cybersecurity dashboard'
            },
            mimeType: {
              type: 'string',
              example: 'image/webp'
            },
            size: {
              type: 'number',
              example: 245760
            },
            dimensions: {
              type: 'object',
              properties: {
                width: {
                  type: 'number',
                  example: 1920
                },
                height: {
                  type: 'number',
                  example: 1080
                }
              }
            },
            type: {
              type: 'string',
              enum: ['image', 'document'],
              example: 'image'
            },
            folder: {
              type: 'string',
              example: 'homepage'
            },
            uploadedBy: {
              $ref: '#/components/schemas/User'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-03-27T10:30:00.000Z'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@panzerit.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePass123!'
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword', 'confirmPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              example: 'OldPass123!'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              example: 'NewPass456!'
            },
            confirmPassword: {
              type: 'string',
              example: 'NewPass456!'
            }
          }
        },
        LeadRequest: {
          type: 'object',
          required: ['name', 'email', 'message'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'Jane Smith'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'jane@company.com'
            },
            phone: {
              type: 'string',
              example: '+1-555-0123'
            },
            company: {
              type: 'string',
              maxLength: 150,
              example: 'Tech Corp'
            },
            message: {
              type: 'string',
              minLength: 10,
              maxLength: 2000,
              example: 'Interested in your cybersecurity solutions...'
            },
            source: {
              type: 'string',
              maxLength: 100,
              example: 'Contact Page'
            }
          }
        },
        PostRequest: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              example: 'Understanding Zero Trust Security'
            },
            excerpt: {
              type: 'string',
              maxLength: 500,
              example: 'A comprehensive guide to implementing zero trust architecture...'
            },
            content: {
              type: 'string',
              example: '<p>Rich HTML content...</p>'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              maxItems: 10,
              example: ['security', 'zero-trust']
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'draft'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  maxLength: 70,
                  example: 'Understanding Zero Trust Security | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  maxLength: 160,
                  example: 'Learn about zero trust security architecture...'
                },
                ogImage: {
                  type: 'string',
                  example: '/uploads/images/og-image.webp'
                }
              }
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Zero Trust Security Diagram'
                }
              }
            }
          }
        },
        SolutionRequest: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              example: 'Network Security Solutions'
            },
            tagline: {
              type: 'string',
              maxLength: 300,
              example: 'Advanced protection for modern networks'
            },
            description: {
              type: 'string',
              example: '<p>Rich HTML content...</p>'
            },
            summary: {
              type: 'string',
              maxLength: 500,
              example: 'Comprehensive network security solutions...'
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Network Security'
                }
              }
            },
            icon: {
              type: 'string',
              example: 'network-icon'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['Firewall Management', 'Intrusion Detection']
            },
            category: {
              type: 'string',
              example: 'Network Security'
            },
            order: {
              type: 'number',
              minimum: 0,
              example: 1
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'draft'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  maxLength: 70,
                  example: 'Network Security Solutions | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  maxLength: 160,
                  example: 'Advanced network security solutions...'
                },
                ogImage: {
                  type: 'string',
                  example: '/uploads/images/og-image.webp'
                }
              }
            }
          }
        },
        BrandRequest: {
          type: 'object',
          required: ['name', 'content', 'logo'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              example: 'Cisco Systems'
            },
            tagline: {
              type: 'string',
              maxLength: 300,
              example: 'Leader in networking and security'
            },
            summary: {
              type: 'string',
              maxLength: 500,
              example: 'Cisco provides industry-leading solutions...'
            },
            content: {
              type: 'string',
              example: '<p>Rich HTML content...</p>'
            },
            logo: {
              type: 'object',
              required: ['url'],
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Cisco Logo'
                }
              }
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Cisco Cover Image'
                }
              }
            },
            website: {
              type: 'string',
              format: 'uri',
              example: 'https://www.cisco.com'
            },
            category: {
              type: 'string',
              example: 'Network Security'
            },
            order: {
              type: 'number',
              minimum: 0,
              example: 1
            },
            isFeatured: {
              type: 'boolean',
              example: true
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'draft'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  maxLength: 70,
                  example: 'Cisco Systems | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  maxLength: 160,
                  example: 'Learn about Cisco solutions...'
                },
                ogImage: {
                  type: 'string',
                  example: '/uploads/images/og-image.webp'
                }
              }
            }
          }
        },
        DownloadRequest: {
          type: 'object',
          required: ['title', 'file'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              example: 'Cybersecurity Best Practices Guide'
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: 'Comprehensive guide to cybersecurity...'
            },
            file: {
              type: 'object',
              required: ['url'],
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/documents/doc-abc123.pdf'
                },
                originalName: {
                  type: 'string',
                  example: 'cybersecurity-guide.pdf'
                },
                size: {
                  type: 'number',
                  example: 2048576
                },
                mimeType: {
                  type: 'string',
                  example: 'application/pdf'
                }
              }
            },
            coverImage: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  example: '/uploads/images/img-abc123.webp'
                },
                alt: {
                  type: 'string',
                  example: 'Guide Cover'
                }
              }
            },
            category: {
              type: 'string',
              example: 'Whitepaper'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'draft'
            },
            seo: {
              type: 'object',
              properties: {
                metaTitle: {
                  type: 'string',
                  maxLength: 70,
                  example: 'Cybersecurity Guide | Panzer IT'
                },
                metaDescription: {
                  type: 'string',
                  maxLength: 160,
                  example: 'Download our cybersecurity guide...'
                }
              }
            }
          }
        },
        UpdateLeadRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['new', 'contacted', 'qualified', 'lost'],
              example: 'contacted'
            },
            notes: {
              type: 'string',
              maxLength: 1000,
              example: 'Followed up via email on 2026-03-27'
            }
          }
        },
        ReorderSolutionsRequest: {
          type: 'object',
          required: ['order'],
          properties: {
            order: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'order'],
                properties: {
                  id: {
                    type: 'string',
                    example: '507f1f77bcf86cd799439011'
                  },
                  order: {
                    type: 'number',
                    minimum: 0,
                    example: 1
                  }
                }
              },
              example: [
                { id: '507f1f77bcf86cd799439011', order: 1 },
                { id: '507f1f77bcf86cd799439012', order: 2 }
              ]
            }
          }
        },
        LeadStats: {
          type: 'object',
          properties: {
            byStatus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                    example: 'new'
                  },
                  count: {
                    type: 'number',
                    example: 25
                  }
                }
              }
            },
            total: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  count: {
                    type: 'number',
                    example: 150
                  }
                }
              }
            },
            last30Days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  count: {
                    type: 'number',
                    example: 45
                  }
                }
              }
            },
            last7Days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  count: {
                    type: 'number',
                    example: 12
                  }
                }
              }
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              example: 1
            },
            limit: {
              type: 'number',
              example: 10
            },
            totalPages: {
              type: 'number',
              example: 15
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            total: {
              type: 'number',
              example: 150
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta'
            },
            data: {
              type: 'object',
              properties: {
                posts: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Post'
                  }
                },
                solutions: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Solution'
                  }
                },
                brands: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Brand'
                  }
                },
                downloads: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Download'
                  }
                },
                leads: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Lead'
                  }
                },
                lead: {
                  $ref: '#/components/schemas/Lead'
                },
                post: {
                  $ref: '#/components/schemas/Post'
                },
                solution: {
                  $ref: '#/components/schemas/Solution'
                },
                brand: {
                  $ref: '#/components/schemas/Brand'
                },
                download: {
                  $ref: '#/components/schemas/Download'
                },
                user: {
                  $ref: '#/components/schemas/User'
                },
                stats: {
                  $ref: '#/components/schemas/LeadStats'
                },
                media: {
                  $ref: '#/components/schemas/Media'
                },
                mediaItems: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Media'
                  }
                },
                folders: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: {
                        type: 'string',
                        example: 'general'
                      },
                      count: {
                        type: 'number',
                        example: 25
                      }
                    }
                  }
                }
              }
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      },
      parameters: {
        pageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        limitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        sortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort fields (comma-separated, use - for descending)',
          required: false,
          schema: {
            type: 'string',
            example: '-createdAt,title'
          }
        },
        fieldsParam: {
          name: 'fields',
          in: 'query',
          description: 'Fields to include in response (comma-separated)',
          required: false,
          schema: {
            type: 'string',
            example: 'title,slug,createdAt'
          }
        },
        searchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term for full-text search',
          required: false,
          schema: {
            type: 'string',
            example: 'security'
          }
        },
        categoryParam: {
          name: 'category',
          in: 'query',
          description: 'Filter by category',
          required: false,
          schema: {
            type: 'string',
            example: 'Network Security'
          }
        },
        statusParam: {
          name: 'status',
          in: 'query',
          description: 'Filter by status',
          required: false,
          schema: {
            type: 'string',
            enum: ['draft', 'published', 'new', 'contacted', 'qualified', 'lost'],
            example: 'published'
          }
        },
        featuredParam: {
          name: 'featured',
          in: 'query',
          description: 'Filter featured items only',
          required: false,
          schema: {
            type: 'string',
            enum: ['true', 'false'],
            example: 'true'
          }
        },
        tagsParam: {
          name: 'tags',
          in: 'query',
          description: 'Filter by tags (comma-separated)',
          required: false,
          schema: {
            type: 'string',
            example: 'security,zero-trust'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health Check',
          description: 'Check if the API is running and healthy',
          tags: ['Health'],
          security: [],
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      },
                      message: {
                        type: 'string',
                        example: 'Server is running.'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Admin Login',
          description: 'Authenticate admin user and return JWT token',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              user: { $ref: '#/components/schemas/User' },
                              token: { type: 'string' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            429: {
              description: 'Too many login attempts',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/auth/logout': {
        post: {
          summary: 'Admin Logout',
          description: 'Clear JWT token and log out admin user',
          tags: ['Authentication'],
          responses: {
            200: {
              description: 'Logout successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Logged out successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/me': {
        get: {
          summary: 'Get Current User',
          description: 'Get information about the currently authenticated user',
          tags: ['Authentication'],
          responses: {
            200: {
              description: 'User information retrieved',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              user: { $ref: '#/components/schemas/User' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            401: {
              description: 'Not authenticated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/auth/password': {
        put: {
          summary: 'Change Password',
          description: 'Change the current user password',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ChangePasswordRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Password changed successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              user: { $ref: '#/components/schemas/User' },
                              token: { type: 'string' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            400: {
              description: 'Invalid request or password requirements not met',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            401: {
              description: 'Current password incorrect',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/leads': {
        post: {
          summary: 'Submit Contact Form',
          description: 'Submit a contact form lead (public endpoint)',
          tags: ['Leads'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LeadRequest'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Lead submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: {
                            type: 'string',
                            example: 'Thank you for reaching out! We\'ll get back to you within 1–2 business days.'
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            422: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            429: {
              description: 'Too many submissions',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        get: {
          summary: 'Get All Leads (Admin)',
          description: 'Get paginated list of all leads for admin dashboard',
          tags: ['Leads'],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/statusParam' }
          ],
          responses: {
            200: {
              description: 'Leads retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              leads: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Lead' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            403: {
              description: 'Insufficient permissions',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/leads/{id}': {
        get: {
          summary: 'Get Single Lead (Admin)',
          description: 'Get detailed information about a specific lead',
          tags: ['Leads'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Lead ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Lead retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              lead: { $ref: '#/components/schemas/Lead' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Lead not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        patch: {
          summary: 'Update Lead (Admin)',
          description: 'Update lead status and notes',
          tags: ['Leads'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Lead ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateLeadRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Lead updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              lead: { $ref: '#/components/schemas/Lead' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Lead not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete Lead (Admin Only)',
          description: 'Delete a lead permanently (admin only)',
          tags: ['Leads'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Lead ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Lead deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Lead deleted successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Lead not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/leads/stats': {
        get: {
          summary: 'Get Lead Statistics (Admin)',
          description: 'Get dashboard statistics for leads',
          tags: ['Leads'],
          responses: {
            200: {
              description: 'Statistics retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              stats: { $ref: '#/components/schemas/LeadStats' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/posts': {
        get: {
          summary: 'Get Published Posts (Public)',
          description: 'Get paginated list of published blog posts',
          tags: ['Posts'],
          security: [],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/tagsParam' }
          ],
          responses: {
            200: {
              description: 'Posts retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              posts: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Post' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create Post (Admin)',
          description: 'Create a new blog post',
          tags: ['Posts'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/PostRequest' },
                    {
                      type: 'object',
                      properties: {
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Post created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              post: { $ref: '#/components/schemas/Post' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            422: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/posts/{slug}': {
        get: {
          summary: 'Get Post by Slug (Public)',
          description: 'Get a single published post by its slug',
          tags: ['Posts'],
          security: [],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              description: 'Post slug',
              schema: {
                type: 'string',
                example: 'understanding-zero-trust-security'
              }
            }
          ],
          responses: {
            200: {
              description: 'Post retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              post: { $ref: '#/components/schemas/Post' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Post not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/posts/admin': {
        get: {
          summary: 'Get All Posts (Admin)',
          description: 'Get paginated list of all posts (drafts + published)',
          tags: ['Posts'],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/statusParam' }
          ],
          responses: {
            200: {
              description: 'Posts retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              posts: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Post' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/posts/admin/{id}': {
        get: {
          summary: 'Get Post by ID (Admin)',
          description: 'Get a single post by ID (includes drafts)',
          tags: ['Posts'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Post ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Post retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              post: { $ref: '#/components/schemas/Post' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Post not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/posts/{id}': {
        put: {
          summary: 'Update Post (Admin)',
          description: 'Update an existing post',
          tags: ['Posts'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Post ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/PostRequest' },
                    {
                      type: 'object',
                      properties: {
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Post updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Post not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete Post (Admin Only)',
          description: 'Delete a post permanently (admin only)',
          tags: ['Posts'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Post ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Post deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Post deleted successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Post not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/solutions': {
        get: {
          summary: 'Get Published Solutions (Public)',
          description: 'Get paginated list of published solutions',
          tags: ['Solutions'],
          security: [],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/categoryParam' }
          ],
          responses: {
            200: {
              description: 'Solutions retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              solutions: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Solution' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create Solution (Admin)',
          description: 'Create a new solution',
          tags: ['Solutions'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SolutionRequest' },
                    {
                      type: 'object',
                      properties: {
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Solution created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              solution: { $ref: '#/components/schemas/Solution' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            422: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/solutions/{slug}': {
        get: {
          summary: 'Get Solution by Slug (Public)',
          description: 'Get a single published solution by its slug',
          tags: ['Solutions'],
          security: [],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              description: 'Solution slug',
              schema: {
                type: 'string',
                example: 'network-security-solutions'
              }
            }
          ],
          responses: {
            200: {
              description: 'Solution retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              solution: { $ref: '#/components/schemas/Solution' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Solution not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/solutions/admin': {
        get: {
          summary: 'Get All Solutions (Admin)',
          description: 'Get paginated list of all solutions (drafts + published)',
          tags: ['Solutions'],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/statusParam' },
            { $ref: '#/components/parameters/categoryParam' }
          ],
          responses: {
            200: {
              description: 'Solutions retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              solutions: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Solution' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/solutions/admin/{id}': {
        get: {
          summary: 'Get Solution by ID (Admin)',
          description: 'Get a single solution by ID (includes drafts)',
          tags: ['Solutions'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Solution ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Solution retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              solution: { $ref: '#/components/schemas/Solution' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Solution not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/solutions/{id}': {
        put: {
          summary: 'Update Solution (Admin)',
          description: 'Update an existing solution',
          tags: ['Solutions'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Solution ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SolutionRequest' },
                    {
                      type: 'object',
                      properties: {
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Solution updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              solution: { $ref: '#/components/schemas/Solution' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Solution not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete Solution (Admin Only)',
          description: 'Delete a solution permanently (admin only)',
          tags: ['Solutions'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Solution ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Solution deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Solution deleted successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Solution not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/solutions/reorder': {
        patch: {
          summary: 'Reorder Solutions (Admin)',
          description: 'Bulk update display order of solutions',
          tags: ['Solutions'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ReorderSolutionsRequest'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Solutions reordered successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Solutions reordered successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            400: {
              description: 'Invalid request format',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/brands': {
        get: {
          summary: 'Get Published Brands (Public)',
          description: 'Get paginated list of published brands',
          tags: ['Brands'],
          security: [],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/categoryParam' },
            { $ref: '#/components/parameters/featuredParam' }
          ],
          responses: {
            200: {
              description: 'Brands retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              brands: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Brand' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create Brand (Admin)',
          description: 'Create a new brand/partner',
          tags: ['Brands'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/BrandRequest' },
                    {
                      type: 'object',
                      properties: {
                        logo: {
                          type: 'string',
                          format: 'binary',
                          description: 'Brand logo file'
                        },
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Brand created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              brand: { $ref: '#/components/schemas/Brand' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            422: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/brands/{slug}': {
        get: {
          summary: 'Get Brand by Slug (Public)',
          description: 'Get a single published brand by its slug',
          tags: ['Brands'],
          security: [],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              description: 'Brand slug',
              schema: {
                type: 'string',
                example: 'cisco-systems'
              }
            }
          ],
          responses: {
            200: {
              description: 'Brand retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Brand not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/brands/admin': {
        get: {
          summary: 'Get All Brands (Admin)',
          description: 'Get paginated list of all brands (drafts + published)',
          tags: ['Brands'],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/statusParam' },
            { $ref: '#/components/parameters/categoryParam' }
          ],
          responses: {
            200: {
              description: 'Brands retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              brands: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Brand' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/brands/admin/{id}': {
        get: {
          summary: 'Get Brand by ID (Admin)',
          description: 'Get a single brand by ID (includes drafts)',
          tags: ['Brands'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Brand ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Brand retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              brand: { $ref: '#/components/schemas/Brand' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Brand not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/brands/{id}': {
        put: {
          summary: 'Update Brand (Admin)',
          description: 'Update an existing brand',
          tags: ['Brands'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Brand ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/BrandRequest' },
                    {
                      type: 'object',
                      properties: {
                        logo: {
                          type: 'string',
                          format: 'binary',
                          description: 'Brand logo file'
                        },
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Brand updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              brand: { $ref: '#/components/schemas/Brand' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Brand not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete Brand (Admin Only)',
          description: 'Delete a brand permanently (admin only)',
          tags: ['Brands'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Brand ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Brand deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Brand deleted successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Brand not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/downloads': {
        get: {
          summary: 'Get Published Downloads (Public)',
          description: 'Get paginated list of published downloads',
          tags: ['Downloads'],
          security: [],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/categoryParam' }
          ],
          responses: {
            200: {
              description: 'Downloads retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              downloads: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Download' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create Download (Admin)',
          description: 'Create a new download with file upload',
          tags: ['Downloads'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/DownloadRequest' },
                    {
                      type: 'object',
                      properties: {
                        file: {
                          type: 'string',
                          format: 'binary',
                          description: 'File to upload'
                        },
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Download created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              download: { $ref: '#/components/schemas/Download' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            422: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/downloads/{slug}/file': {
        get: {
          summary: 'Download File (Public)',
          description: 'Download a file and increment download count',
          tags: ['Downloads'],
          security: [],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              description: 'Download slug',
              schema: {
                type: 'string',
                example: 'cybersecurity-best-practices-guide'
              }
            }
          ],
          responses: {
            200: {
              description: 'File download initiated',
              content: {
                'application/octet-stream': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            },
            404: {
              description: 'Download not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/downloads/admin': {
        get: {
          summary: 'Get All Downloads (Admin)',
          description: 'Get paginated list of all downloads (drafts + published)',
          tags: ['Downloads'],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            { $ref: '#/components/parameters/statusParam' },
            { $ref: '#/components/parameters/categoryParam' }
          ],
          responses: {
            200: {
              description: 'Downloads retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              downloads: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Download' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/downloads/admin/{id}': {
        get: {
          summary: 'Get Download by ID (Admin)',
          description: 'Get a single download by ID (includes drafts)',
          tags: ['Downloads'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Download ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Download retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              download: { $ref: '#/components/schemas/Download' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Download not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/downloads/{id}': {
        put: {
          summary: 'Update Download (Admin)',
          description: 'Update an existing download',
          tags: ['Downloads'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Download ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/DownloadRequest' },
                    {
                      type: 'object',
                      properties: {
                        file: {
                          type: 'string',
                          format: 'binary',
                          description: 'File to upload'
                        },
                        image: {
                          type: 'string',
                          format: 'binary',
                          description: 'Cover image file'
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Download updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              download: { $ref: '#/components/schemas/Download' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Download not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete Download (Admin Only)',
          description: 'Delete a download permanently (admin only)',
          tags: ['Downloads'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Download ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Download deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Download deleted successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Download not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/media/folders': {
        get: {
          summary: 'Get Media Folders',
          description: 'Get list of all media folders with item counts',
          tags: ['Media'],
          responses: {
            200: {
              description: 'Folders retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              folders: {
                                $ref: '#/components/schemas/ApiResponse/properties/data/properties/folders'
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      '/api/media/bulk': {
        post: {
          summary: 'Bulk Upload Media',
          description: 'Upload multiple media files at once (up to 10 files)',
          tags: ['Media'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    files: {
                      type: 'array',
                      items: {
                        type: 'string',
                        format: 'binary',
                        description: 'Media files to upload'
                      },
                      maxItems: 10,
                      description: 'Array of media files (images or documents)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Media files uploaded successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              mediaItems: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Media' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            400: {
              description: 'Invalid files or upload error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Bulk Delete Media (Admin Only)',
          description: 'Delete multiple media items at once',
          tags: ['Media'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['ids'],
                  properties: {
                    ids: {
                      type: 'array',
                      items: {
                        type: 'string',
                        example: '507f1f77bcf86cd799439011'
                      },
                      minItems: 1,
                      description: 'Array of media IDs to delete'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Media items deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Media items deleted successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'One or more media items not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/media': {
        get: {
          summary: 'Get All Media',
          description: 'Get paginated list of all media items',
          tags: ['Media'],
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            { $ref: '#/components/parameters/sortParam' },
            { $ref: '#/components/parameters/fieldsParam' },
            { $ref: '#/components/parameters/searchParam' },
            {
              name: 'type',
              in: 'query',
              description: 'Filter by media type',
              required: false,
              schema: {
                type: 'string',
                enum: ['image', 'document'],
                example: 'image'
              }
            },
            {
              name: 'folder',
              in: 'query',
              description: 'Filter by folder',
              required: false,
              schema: {
                type: 'string',
                example: 'homepage'
              }
            }
          ],
          responses: {
            200: {
              description: 'Media items retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              mediaItems: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Media' }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Upload Single Media',
          description: 'Upload a single image or document file',
          tags: ['Media'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Media file to upload (image or document)'
                    },
                    alt: {
                      type: 'string',
                      maxLength: 300,
                      description: 'Alt text for accessibility'
                    },
                    caption: {
                      type: 'string',
                      maxLength: 300,
                      description: 'Caption for the media item'
                    },
                    folder: {
                      type: 'string',
                      maxLength: 100,
                      description: 'Folder to organize the media item'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Media file uploaded successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              media: { $ref: '#/components/schemas/Media' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            400: {
              description: 'Invalid file or upload error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api/media/{id}': {
        get: {
          summary: 'Get Single Media Item',
          description: 'Get detailed information about a specific media item',
          tags: ['Media'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Media ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Media item retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              media: { $ref: '#/components/schemas/Media' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Media item not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        patch: {
          summary: 'Update Media Item',
          description: 'Update metadata for a media item (alt text, caption, folder)',
          tags: ['Media'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Media ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    alt: {
                      type: 'string',
                      maxLength: 300,
                      description: 'Alt text for accessibility'
                    },
                    caption: {
                      type: 'string',
                      maxLength: 300,
                      description: 'Caption for the media item'
                    },
                    folder: {
                      type: 'string',
                      maxLength: 100,
                      description: 'Folder to organize the media item'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Media item updated successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              media: { $ref: '#/components/schemas/Media' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Media item not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete Media Item (Admin Only)',
          description: 'Delete a media item permanently',
          tags: ['Media'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'Media ID',
              schema: {
                type: 'string',
                example: '507f1f77bcf86cd799439011'
              }
            }
          ],
          responses: {
            200: {
              description: 'Media item deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Media item deleted successfully.' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            404: {
              description: 'Media item not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Backward compatibility for older swagger-jsdoc versions that require `swaggerDefinition`.
options.swaggerDefinition = options.definition;

const specs = swaggerJSDoc(options);

module.exports = { swaggerUi, specs };