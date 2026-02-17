import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.sender_email = os.getenv("SENDER_EMAIL", "")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")
    
    def send_order_confirmation(self, recipient_email, recipient_name, order_id, order_details):
        """
        Send order confirmation email
        """
        try:
            if not self.sender_email or not self.sender_password:
                print("Email service not configured. Skipping email.")
                return True
            
            subject = f"Order Confirmation - #{order_id}"
            
            # Create HTML email body
            items_html = ""
            for item in order_details.get("items", []):
                items_html += f"""
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">{item['name']}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">{item['quantity']}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item['price']:.2f}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item['total']:.2f}</td>
                </tr>
                """
            
            body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1a1a1a;">Thank you for your order!</h2>
                        
                        <p>Hi {recipient_name},</p>
                        
                        <p>Your order has been confirmed and will be processed shortly.</p>
                        
                        <h3 style="border-top: 2px solid #f0f0f0; padding-top: 20px;">Order Details</h3>
                        <p><strong>Order ID:</strong> #{order_id}</p>
                        <p><strong>Order Date:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                        <p><strong>Status:</strong> Confirmed</p>
                        
                        <h3 style="border-top: 2px solid #f0f0f0; padding-top: 20px;">Items Ordered</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f9f9f9;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items_html}
                            </tbody>
                        </table>
                        
                        <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 20px;">
                            <p style="text-align: right; font-size: 18px;">
                                <strong>Total Amount: ${order_details.get('total', 0):.2f}</strong>
                            </p>
                        </div>
                        
                        {f"<p><strong>Shipping Address:</strong><br/>{order_details.get('shipping_address', 'Not provided')}</p>" if order_details.get('shipping_address') else ""}
                        
                        <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 20px; color: #666; font-size: 12px;">
                            <p>If you have any questions about your order, please contact our customer support team.</p>
                            <p>Thank you for shopping with us!</p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            return self._send_email(recipient_email, subject, body)
        
        except Exception as e:
            print(f"Error sending order confirmation email: {str(e)}")
            return False
    
    def send_cart_abandonment(self, recipient_email, recipient_name, cart_items, cart_total):
        """
        Send cart abandonment email reminding user about items in their cart
        """
        try:
            if not self.sender_email or not self.sender_password:
                print("Email service not configured. Skipping email.")
                return True
            
            subject = "You left something in your cart!"
            
            items_html = ""
            for item in cart_items:
                items_html += f"""
                <div style="padding: 12px; margin: 10px 0; border: 1px solid #eee; border-radius: 4px; background: #f9f9f9;">
                    <p style="margin: 0;"><strong>{item['name']}</strong></p>
                    <p style="margin: 5px 0; color: #666; font-size: 14px;">Quantity: {item['quantity']}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 14px;">Price: ${item['price']:.2f}</p>
                    {f"<p style='margin: 5px 0; color: #999; font-size: 12px;'>Color: {item['color']}</p>" if item.get('color') else ""}
                    {f"<p style='margin: 5px 0; color: #999; font-size: 12px;'>Size: {item['size']}</p>" if item.get('size') else ""}
                </div>
                """
            
            body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1a1a1a;">You left something behind!</h2>
                        
                        <p>Hi {recipient_name},</p>
                        
                        <p>We noticed you have items in your cart. Don't miss out on these amazing products!</p>
                        
                        <h3 style="border-top: 2px solid #f0f0f0; padding-top: 20px;">Your Cart Items</h3>
                        {items_html}
                        
                        <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 20px;">
                            <p style="font-size: 16px;">
                                <strong>Cart Total: ${cart_total:.2f}</strong>
                            </p>
                        </div>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="http://localhost:3000/cart" style="background-color: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Your Purchase</a>
                        </div>
                        
                        <div style="border-top: 2px solid #f0f0f0; padding-top: 20px; margin-top: 20px; color: #666; font-size: 12px;">
                            <p>This is an automated reminder. If you have any questions, please contact our support team.</p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            return self._send_email(recipient_email, subject, body)
        
        except Exception as e:
            print(f"Error sending cart abandonment email: {str(e)}")
            return False
    
    def _send_email(self, recipient_email, subject, body):
        """
        Internal method to send email
        """
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            part = MIMEText(body, "html")
            message.attach(part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False
