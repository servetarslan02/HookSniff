from setuptools import setup, find_packages

setup(
    name="hooksniff",
    version="0.4.0",
    description="Official Python client for HookSniff webhook delivery service",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="HookSniff",
    author_email="support@hooksniff.dev",
    url="https://github.com/hooksniff/hooksniff",
    license="MIT",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.28.0",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
)
