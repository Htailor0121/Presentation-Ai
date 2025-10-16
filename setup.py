#!/usr/bin/env python3
"""
Setup script for Presentation AI
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f" {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f" {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f" {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up Presentation AI...")
    print("=" * 50)
    
    # Check if Python is installed
    if not run_command("python --version", "Checking Python installation"):
        print(" Python is not installed. Please install Python 3.8+ first.")
        return False
    
    # Check if Node.js is installed
    if not run_command("node --version", "Checking Node.js installation"):
        print(" Node.js is not installed. Please install Node.js first.")
        return False
    
    # Install frontend dependencies
    if not run_command("npm install", "Installing frontend dependencies"):
        print(" Failed to install frontend dependencies")
        return False
    
    # Install backend dependencies
    if not run_command("cd backend && pip install -r requirements.txt", "Installing backend dependencies"):
        print(" Failed to install backend dependencies")
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\nTo start the application:")
    print("  Windows: start.bat")
    print("  Mac/Linux: ./start.sh")
    print("\nOr manually:")
    print("  Backend: cd backend && python run.py")
    print("  Frontend: npm run dev")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
