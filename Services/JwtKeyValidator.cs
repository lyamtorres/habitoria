using System.Text;

namespace HabitTracker.Services
{
    /// <summary>
    /// Provides validation for JWT signing keys to ensure they meet minimum security requirements.
    /// </summary>
    public static class JwtKeyValidator
    {
        /// <summary>
        /// Minimum key length in bytes required for HMAC-SHA256 (256 bits).
        /// </summary>
        private const int MinimumKeyLengthBytes = 32;

        /// <summary>
        /// Validates that a JWT signing key meets minimum security requirements.
        /// </summary>
        /// <param name="key">The JWT signing key to validate.</param>
        /// <returns>The UTF-8 encoded byte array of the key.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the key doesn't meet minimum requirements.</exception>
        public static byte[] ValidateAndGetKeyBytes(string key)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key);

            if (keyBytes.Length < MinimumKeyLengthBytes)
            {
                throw new InvalidOperationException(
                    $"JWT signing key must be at least {MinimumKeyLengthBytes} bytes ({MinimumKeyLengthBytes * 8} bits) for HMAC-SHA256. " +
                    $"Current key length: {keyBytes.Length} bytes. " +
                    "Please configure a secure key in appsettings.json or environment variables.");
            }

            return keyBytes;
        }
    }
}
