// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "HookSniff",
    platforms: [
        .macOS(.v12),
        .iOS(.v15),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(name: "HookSniff", targets: ["HookSniff"])
    ],
    targets: [
        .target(
            name: "HookSniff",
            dependencies: [],
            path: "OpenAPIClient/Classes/OpenAPIs"
        )
    ]
)
