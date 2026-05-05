from setuptools import setup, find_packages

setup(
    name="hookrelay",
    version="0.2.0",
    description="Official Python client for HookRelay webhook delivery service",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="HookRelay",
    author_email="support@hookrelay.dev",
    url="https://github.com/hookrelay/hookrelay",
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
