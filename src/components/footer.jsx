function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 w-full bg-black py-4 text-white">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Event Manager. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
