from setuptools import setup, find_packages

setup(
    name="hooksniff-agent",
    version="0.1.0",
    description="HookSniff AI Agent SDK — Agent'lar arası event iletişimi",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.28.0",
        "websocket-client>=1.5.0",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
    ],
)
